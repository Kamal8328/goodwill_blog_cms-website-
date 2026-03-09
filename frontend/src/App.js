import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import LoginPage from "./pages/LoginPage";
import BlogpostPage from "./pages/BlogpostPage";
import CategoriesPage from "./pages/CategoriesPage";
import TagsPage from "./pages/TagsPage";
import MediaLibraryPage from "./pages/MediaLibraryPage";
import EditPostPage from "./pages/EditPostPage";
import CounsellingdataPage from "./pages/CounsellingdataPage";
import BlogPostDetail from "./pages/BlogPostDetail";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import CreatePost from "./pages/CreatePost";
import ViewPost from "./pages/ViewPost";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import BlogPage from "./components/BlogPage"
import CommentsPage from "./pages/CommentsPage";

// --- SECURITY GUARD ---
const PrivateRoutes = () => {
  const token = localStorage.getItem("token");
  // If no token, redirect to login immediately
  return token ? <Layout /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- PUBLIC ROUTES (Move these OUTSIDE PrivateRoutes) --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* --- PROTECTED ROUTES (Must be logged in) --- */}
        <Route element={<PrivateRoutes />}>
          {/* Default path should go to Dashboard */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/blogpost" element={<BlogpostPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/blogList" element={<BlogPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/media" element={<MediaLibraryPage />} />
          <Route path="/edit/:id" element={<EditPostPage />} />
          <Route path="/posts/view/:id" element={<ViewPost />} />
          <Route path="/counselling" element={<CounsellingdataPage />} />
          <Route path="/comments" element={<CommentsPage />} />
          
          <Route path="/blog/:id" element={<BlogPostDetail />} />
          <Route path="/create" element={<CreatePost />} />
        </Route>

        {/* Fallback: if user goes to a random URL, send them home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;