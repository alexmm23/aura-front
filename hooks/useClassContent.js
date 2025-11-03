import { useState, useEffect } from "react";
import { API } from "@/config/api";
import { apiGet } from "../utils/fetchWithAuth";
import Toast from "react-native-toast-message";

export const useClassContent = (classId, platform = "classroom") => {
  const [classDetails, setClassDetails] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [coursework, setCoursework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Función para extraer ID original
  const getOriginalId = (id) => {
    if (typeof id === 'string') {
      if (id.startsWith('moodle_')) {
        const parts = id.split('_');
        return parts[1]; // Retorna solo el courseId numérico
      }
      if (id.startsWith('classroom_')) {
        const parts = id.split('_');
        return parts[1];
      }
    }
    return id;
  };

  const fetchClassroomContent = async () => {
    try {
      const actualClassId = getOriginalId(classId);
      
      console.log('📡 Fetching Classroom content for:', actualClassId);

      const detailsUrl = `/auth/google/courses/${actualClassId}`;
      const courseworkUrl = `/auth/google/courses/${actualClassId}/coursework`;
      const announcementsUrl = `/auth/google/courses/${actualClassId}/announcements`;

      console.log('🔗 URLs:', { detailsUrl, courseworkUrl, announcementsUrl });

      const [detailsRes, courseworkRes, announcementsRes] = await Promise.all([
        apiGet(detailsUrl),
        apiGet(courseworkUrl),
        apiGet(announcementsUrl),
      ]);

      // Process course details
      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        console.log('📚 Class details:', detailsData);
        setClassDetails(detailsData.success ? detailsData.data : detailsData);
      }

      // Process coursework
      if (courseworkRes.ok) {
        const courseworkData = await courseworkRes.json();
        console.log('📝 Raw coursework response:', courseworkData);
        
        let courseworkList = [];
        if (courseworkData.success) {
          const data = courseworkData.data;
          courseworkList = data?.courseWork || data?.coursework || data || [];
        } else {
          courseworkList = courseworkData.courseWork || 
                          courseworkData.coursework || 
                          courseworkData || [];
        }
        
        console.log('✅ Coursework list:', courseworkList.length);
        setCoursework(Array.isArray(courseworkList) ? courseworkList : []);
      } else {
        console.warn('⚠️ Coursework request failed:', courseworkRes.status);
        setCoursework([]);
      }

      // Process announcements
      if (announcementsRes.ok) {
        const announcementsData = await announcementsRes.json();
        console.log('📢 Raw announcements response:', announcementsData);
        
        let announcementsList = [];
        if (announcementsData.success) {
          const data = announcementsData.data;
          announcementsList = data?.announcements || data || [];
        } else {
          announcementsList = announcementsData.announcements || 
                             announcementsData || [];
        }
        
        console.log('✅ Announcements list:', announcementsList.length);
        console.log('📋 First announcement:', announcementsList[0]);
        setAnnouncements(Array.isArray(announcementsList) ? announcementsList : []);
      } else {
        console.warn('⚠️ Announcements request failed:', announcementsRes.status);
        const errorText = await announcementsRes.text();
        console.error('Error response:', errorText);
        setAnnouncements([]);
      }
    } catch (error) {
      console.error("❌ Error fetching Classroom content:", error);
      throw error;
    }
  };

  const fetchMoodleContent = async () => {
    try {
      const actualClassId = getOriginalId(classId);
      
      console.log('📡 Fetching Moodle content for course:', actualClassId);
      console.log('🆔 Course ID type:', typeof actualClassId, 'Value:', actualClassId);

      const courseUrl = `/moodle/courses/${actualClassId}`;
      const assignmentsUrl = `/moodle/courses/${actualClassId}/assignments`;
      const announcementsUrl = `/moodle/courses/${actualClassId}/announcements`;

      console.log('🔗 Moodle URLs:', { courseUrl, assignmentsUrl, announcementsUrl });

      // Obtener detalles del curso (opcional)
      try {
        const courseRes = await apiGet(courseUrl);
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          console.log('📚 Moodle course details:', courseData);
          setClassDetails(courseData.success ? courseData.data : courseData);
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch Moodle course details:', error);
      }

      // ✅ Obtener assignments con filtrado
      const assignmentsRes = await apiGet(assignmentsUrl);
      if (assignmentsRes.ok) {
        const assignmentsData = await assignmentsRes.json();
        console.log('📦 Moodle assignments response:', assignmentsData);
        
        let assignmentsList = assignmentsData.success
          ? assignmentsData.data || []
          : assignmentsData || [];

        console.log(`📊 Total assignments received: ${assignmentsList.length}`);

        // ✅ FILTRAR assignments por courseId
        const filteredAssignments = assignmentsList.filter((assignment) => {
          // El campo puede ser 'course', 'courseId', o 'cmid'
          const assignmentCourseId = assignment.course || 
                                     assignment.courseId || 
                                     assignment.courseid;
          
          const matches = assignmentCourseId?.toString() === actualClassId.toString();
          
          if (!matches) {
            console.log(`🚫 Filtering out: "${assignment.name}" (courseId: ${assignmentCourseId})`);
          } else {
            console.log(`✅ Including: "${assignment.name}" (courseId: ${assignmentCourseId})`);
          }
          
          return matches;
        });

        console.log(`✅ Filtered assignments for course ${actualClassId}: ${filteredAssignments.length}/${assignmentsList.length}`);

        // Normalizar solo las assignments filtradas
        const normalizedAssignments = filteredAssignments.map((assignment) => ({
          id: `moodle_${assignment.id}`,
          title: assignment.name,
          description: assignment.intro?.replace(/<[^>]*>/g, '') || '',
          dueDate: assignment.duedate 
            ? {
                year: new Date(assignment.duedate * 1000).getFullYear(),
                month: new Date(assignment.duedate * 1000).getMonth() + 1,
                day: new Date(assignment.duedate * 1000).getDate(),
              }
            : null,
          maxPoints: assignment.grade || null,
          workType: "ASSIGNMENT",
          state: assignment.submission?.status || "NEW",
          materials: [],
          platform: "moodle",
          creationTime: assignment.timemodified ? assignment.timemodified * 1000 : Date.now(),
          courseId: assignment.course || assignment.courseId, // Guardar courseId para referencia
        }));

        console.log('✅ Normalized Moodle assignments:', normalizedAssignments);
        setCoursework(normalizedAssignments);
      } else {
        console.error('❌ Failed to fetch Moodle assignments:', assignmentsRes.status);
        const errorText = await assignmentsRes.text();
        console.error('Error details:', errorText);
        setCoursework([]);
      }

      // ✅ Obtener announcements con filtrado
      try {
        const announcementsRes = await apiGet(announcementsUrl);
        if (announcementsRes.ok) {
          const announcementsData = await announcementsRes.json();
          console.log('📢 Moodle announcements response:', announcementsData);
          
          let announcementsList = announcementsData.success
            ? announcementsData.data || []
            : announcementsData || [];

          console.log(`📊 Total announcements received: ${announcementsList.length}`);

          // ✅ FILTRAR announcements por courseId (si aplica)
          const filteredAnnouncements = announcementsList.filter((announcement) => {
            // Los anuncios pueden tener 'course', 'courseId', o venir pre-filtrados
            const announcementCourseId = announcement.course || 
                                        announcement.courseId || 
                                        announcement.courseid;
            
            // Si no tiene courseId, probablemente ya viene filtrado del backend
            if (!announcementCourseId) {
              console.log(`✅ Including announcement (no courseId check): "${announcement.subject || announcement.message?.substring(0, 50)}"`);
              return true;
            }
            
            const matches = announcementCourseId.toString() === actualClassId.toString();
            
            if (!matches) {
              console.log(`🚫 Filtering out announcement (courseId: ${announcementCourseId})`);
            } else {
              console.log(`✅ Including announcement (courseId: ${announcementCourseId})`);
            }
            
            return matches;
          });

          console.log(`✅ Filtered announcements for course ${actualClassId}: ${filteredAnnouncements.length}/${announcementsList.length}`);

          // Normalizar anuncios de Moodle al formato común
          const normalizedAnnouncements = filteredAnnouncements.map((announcement) => ({
            id: `moodle_announcement_${announcement.id}`,
            text: announcement.message?.replace(/<[^>]*>/g, '') || announcement.subject || '',
            creationTime: announcement.created ? announcement.created * 1000 : 
                         announcement.timemodified ? announcement.timemodified * 1000 : 
                         announcement.timecreated ? announcement.timecreated * 1000 : Date.now(),
            updateTime: announcement.timemodified ? announcement.timemodified * 1000 : 
                       announcement.created ? announcement.created * 1000 : Date.now(),
            materials: [],
            platform: "moodle",
            courseId: announcement.course || announcement.courseId, // Guardar courseId para referencia
          }));

          console.log('✅ Normalized Moodle announcements:', normalizedAnnouncements);
          setAnnouncements(normalizedAnnouncements);
        } else {
          console.warn('⚠️ Could not fetch Moodle announcements:', announcementsRes.status);
          setAnnouncements([]);
        }
      } catch (error) {
        console.warn('⚠️ Error fetching Moodle announcements:', error);
        setAnnouncements([]);
      }
      
    } catch (error) {
      console.error("❌ Error fetching Moodle content:", error);
      throw error;
    }
  };

  const fetchClassContent = async () => {
    if (!classId) {
      console.warn('⚠️ No classId provided');
      return;
    }

    try {
      setLoading(true);
      
      console.log('🔄 Fetching class content:', { 
        classId, 
        platform,
        extractedId: getOriginalId(classId)
      });

      if (platform === "moodle") {
        await fetchMoodleContent();
      } else {
        await fetchClassroomContent();
      }

    } catch (error) {
      console.error("❌ Error fetching class content:", error);
      Toast.show({
        type: "error",
        text1: "Error al cargar contenido",
        text2: "No se pudo cargar el contenido de la clase",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClassContent();
  };

  useEffect(() => {
    if (classId) {
      console.log('🔄 useClassContent - Loading content for:', { 
        classId, 
        platform,
        extractedId: getOriginalId(classId)
      });
      fetchClassContent();
    }
  }, [classId, platform]);

  return {
    classDetails,
    announcements,
    coursework,
    loading,
    refreshing,
    onRefresh,
    refetch: fetchClassContent,
    platform,
  };
};