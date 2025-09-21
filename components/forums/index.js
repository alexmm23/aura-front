// Exportar todos los componentes de foros desde un solo archivo
export { ForumCard } from "./ForumCard";
export { PostCard } from "./PostCard";
export { CommentCard } from "./CommentCard";
export { AttachmentViewer } from "./AttachmentViewer";
export { LinksViewer } from "./LinksViewer";

// Re-export como default también para mayor flexibilidad
import ForumCard from "./ForumCard";
import PostCard from "./PostCard";
import CommentCard from "./CommentCard";
import AttachmentViewer from "./AttachmentViewer";
import LinksViewer from "./LinksViewer";

export default {
    ForumCard,
    PostCard,
    CommentCard,
    AttachmentViewer,
    LinksViewer,
};