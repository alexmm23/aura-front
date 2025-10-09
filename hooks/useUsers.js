import { useState, useEffect } from 'react';
import { apiGet } from '../utils/fetchWithAuth';
import { API } from '../config/api';

export const useUsers=(userType='student') => {
    const [users, setUsers]=useState([]);
    const [loading, setLoading]=useState(false);
    const [error, setError]=useState(null);

    // Fetch users from API
    const fetchUsers=async () => {
        try {
            setLoading(true);
            setError(null);

            // Determine which role to fetch based on userType
            const role=userType==='teacher'? 'student':'teacher';
            const endpoint=`${API.ENDPOINTS.USERS.STUDENTS}?role=${role}`;

            const response=await apiGet(endpoint);


            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result=await response.json();
            console.log('Fetched users:', result);
            if (result.success) {
                // The API returns users in result.data.users when filtered by role
                const usersData=result.data.users||[];

                // Transform API data to match our component structure
                const transformedUsers=usersData.map(user => ({
                    id: user.id.toString(),
                    name: user.full_name||`${user.name} ${user.lastname}`,
                    email: user.email,
                    avatar: user.role==='student'? '👩‍🎓':'👨‍🏫',
                    role: user.role,
                    isOnline: Math.random()>0.5, // Mock online status
                    lastSeen: Math.random()>0.7? new Date().toISOString():null,
                    department: user.role==='teacher'? 'Departamento':undefined
                }));

                setUsers(transformedUsers);
            } else {
                throw new Error(result.message||'Error fetching users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setError(error.message);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // Search users
    const searchUsers=async (query) => {
        if (!query.trim()) {
            fetchUsers();
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Determine which role to search based on userType
            const role=userType==='teacher'? 'student':'teacher';
            const endpoint=`${API.ENDPOINTS.USERS.STUDENTS}?role=${role}&search=${encodeURIComponent(query)}`;

            const response=await apiGet(endpoint);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result=await response.json();

            if (result.success) {
                // The API returns users in result.data.users when filtered by role
                const usersData=result.data.users||[];

                // Transform API data to match our component structure
                const transformedUsers=usersData.map(user => ({
                    id: user.id.toString(),
                    name: user.full_name||`${user.name} ${user.lastname}`,
                    email: user.email,
                    avatar: user.role==='student'? '👩‍🎓':'👨‍🏫',
                    role: user.role,
                    isOnline: Math.random()>0.5, // Mock online status
                    lastSeen: Math.random()>0.7? new Date().toISOString():null,
                    department: user.role==='teacher'? 'Departamento':undefined
                }));

                setUsers(transformedUsers);
            } else {
                throw new Error(result.message||'Error searching users');
            }
        } catch (error) {
            console.error('Error searching users:', error);
            setError(error.message);

            // Filter mock data for development
            const mockUsers=[];
            const filtered=mockUsers.filter(user =>
                user.name.toLowerCase().includes(query.toLowerCase())||
                user.email?.toLowerCase().includes(query.toLowerCase())
            );
            setUsers(filtered);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [userType]);

    return {
        users,
        loading,
        error,
        fetchUsers,
        searchUsers
    };
};

// Mock data generator
const getMockUsers=(userType) => {
    const mockStudents=[
        {
            id: "1",
            name: "Ana García Martínez",
            email: "ana.garcia@universidad.edu",
            avatar: "👩‍🎓",
            role: "student",
            isOnline: true,
            lastSeen: null
        },
        {
            id: "2",
            name: "Carlos López Hernández",
            email: "carlos.lopez@universidad.edu",
            avatar: "👨‍🎓",
            role: "student",
            isOnline: false,
            lastSeen: "2024-01-01T10:30:00Z"
        },
        {
            id: "3",
            name: "María Rodríguez Silva",
            email: "maria.rodriguez@universidad.edu",
            avatar: "👩‍🎓",
            role: "student",
            isOnline: true,
            lastSeen: null
        },
        {
            id: "4",
            name: "Diego Fernández Castro",
            email: "diego.fernandez@universidad.edu",
            avatar: "👨‍🎓",
            role: "student",
            isOnline: false,
            lastSeen: "2024-01-01T09:15:00Z"
        },
        {
            id: "5",
            name: "Laura Jiménez Morales",
            email: "laura.jimenez@universidad.edu",
            avatar: "👩‍🎓",
            role: "student",
            isOnline: true,
            lastSeen: null
        },
        {
            id: "6",
            name: "Roberto Sánchez Ruiz",
            email: "roberto.sanchez@universidad.edu",
            avatar: "👨‍🎓",
            role: "student",
            isOnline: false,
            lastSeen: "2024-01-01T08:45:00Z"
        }
    ];

    const mockTeachers=[
        {
            id: "10",
            name: "Mtro. Eduardo De Avila",
            email: "eduardo.avila@universidad.edu",
            avatar: "👨‍🏫",
            role: "teacher",
            department: "Ciencias de la Computación",
            isOnline: true,
            lastSeen: null
        },
        {
            id: "11",
            name: "Mtro. Julian Rodriguez",
            email: "julian.rodriguez@universidad.edu",
            avatar: "👨‍🏫",
            role: "teacher",
            department: "Matemáticas",
            isOnline: false,
            lastSeen: "2024-01-01T10:00:00Z"
        },
        {
            id: "12",
            name: "Mtro. Pedro Lopez",
            email: "pedro.lopez@universidad.edu",
            avatar: "👨‍🏫",
            role: "teacher",
            department: "Física",
            isOnline: true,
            lastSeen: null
        },
        {
            id: "13",
            name: "Mtro. Federico Alvarez",
            email: "federico.alvarez@universidad.edu",
            avatar: "👨‍🏫",
            role: "teacher",
            department: "Ingeniería",
            isOnline: false,
            lastSeen: "2024-01-01T09:30:00Z"
        },
        {
            id: "14",
            name: "Mtro. Ivan Ramirez",
            email: "ivan.ramirez@universidad.edu",
            avatar: "👨‍🏫",
            role: "teacher",
            department: "Química",
            isOnline: true,
            lastSeen: null
        },
        {
            id: "15",
            name: "Mtro. Alejandro Montes",
            email: "alejandro.montes@universidad.edu",
            avatar: "👨‍🏫",
            role: "teacher",
            department: "Historia",
            isOnline: false,
            lastSeen: "2024-01-01T08:00:00Z"
        }
    ];

    return userType==='teacher'? mockStudents:mockTeachers;
};