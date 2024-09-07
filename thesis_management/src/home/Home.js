import React, { useState, useEffect, memo, useContext } from 'react';
import APIs, { endpoints } from '../configs/APIs';
import { MyUserContext } from '../configs/Contexts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartLine, faComment as faCommentLine } from '@fortawesome/free-regular-svg-icons'; 
import { faHeart as faHeartSolid, faBell as faBellSolid, faEnvelope as faEnvelopeSolid,faPaperPlane,faTimes } from '@fortawesome/free-solid-svg-icons'; 
import { useNavigate } from 'react-router-dom'; 
import './Home.css'; 

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [newCommentContent, setNewCommentContent] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postAuthor, setPostAuthor] = useState("");
  const [loadingComments, setLoadingComments] = useState(false); // State for loading comments
  const user = useContext(MyUserContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const fetchPosts = async (page, query) => {
    if (page > 0) {
      let url = `${endpoints['posts']}?q=${query}&page=${page}`;
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        let res = await APIs.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (page === 1) setPosts(res.data.results);
        else if (page > 1) setPosts(current => [...current, ...res.data.results]);
        if (res.data.next === null) setCurrentPage(0);
      } catch (ex) {
        console.error(ex);
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchComments = async (postId, page = 1) => {
    const url = `${endpoints.comments(postId)}?page=${page}`;
    try {
      setLoadingComments(true);
      const token = localStorage.getItem("token");
      const res = await APIs.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (page === 1) {
        setComments(res.data.results || []);
      } else {
        setComments(current => [...current, ...res.data.results]);
      }
      // No need to setCurrentCommentPage since it's not defined
    } catch (ex) {
      if (page === 1) {
        setComments([]);
      }
      console.error(ex);
    } finally {
      setLoadingComments(false);
    }
  };

  const handlePost = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("content", newPostContent);

      const response = await APIs.post(endpoints.posts, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        setModalVisible(false);
        fetchPosts(1, searchQuery);
        setNewPostContent("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostComment = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("content", newCommentContent);

      const response = await APIs.post(endpoints.commentsPost(selectedPostId), formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        fetchComments(selectedPostId);
        setPosts(posts => posts.map(post =>
          post.id === selectedPostId
            ? { ...post, comment_count: post.comment_count + 1 }
            : post
        ));
        setNewCommentContent("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleShowComments = (postId, content, author) => {
    setSelectedPostId(postId);
    setPostContent(content);
    setPostAuthor(author);
    fetchComments(postId);
    setCommentModalVisible(true);
  };

  const handleLike = async (postId) => {
    const url = endpoints.like(postId);

    try {
      const token = localStorage.getItem("token");
      const response = await APIs.post(url, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setPosts(posts.map(post =>
          post.id === postId ? { ...post, liked: !post.liked, like_count: post.liked ? post.like_count - 1 : post.like_count + 1 } : post
        ));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const RenderItem = memo(({ item }) => {
    const [expanded, setExpanded] = useState(false);
    const [isLiked, setIsLiked] = useState(item.liked || false);
    const [likes, setLikes] = useState(item.like_count);

    const handleLikeClick = () => {
      handleLike(item.id);
      setIsLiked(prev => !prev);
      setLikes(prev => isLiked ? prev - 1 : prev + 1);
    };

    return (
      <div key={item.id} className="post-container">
        {/* Avatar và tên người đăng */}
        <div className="account">
          <img src={item.user.avatar} alt="avatar" className="avatar" />
          <span className="username">{item.user.first_name}_{item.user.last_name}</span>
        </div>

        {/* Nội dung bài đăng */}
        <div className="post-item">
          <div className="post-content">
            <span className={expanded ? 'expanded' : ''}>
              {item.content}
            </span>
            {item.content.length > 50 && !expanded && (
              <button onClick={() => setExpanded(!expanded)} className="read-more">
                Read more
              </button>
            )}
          </div>
        </div>

        {/* Nút Like và Comment */}
        <div className="actions">
          <button onClick={handleLikeClick} className="action-button">
            <FontAwesomeIcon icon={isLiked ? faHeartSolid : faHeartLine} />
          </button>
          <button onClick={() => handleShowComments(item.id, item.content, `${item.user.first_name} ${item.user.last_name}`)} className="action-button">
            <FontAwesomeIcon icon={faCommentLine} />
          </button>
        </div>
        <span>{likes} likes • {item.comment_count} comments</span>
      </div>
    );
  });

  return (
    <div className="home-container">
      <header className="header">
        <h1>Home</h1>
        <div className="header-icons">
          <button className="icon-button" onClick={() => navigate('/contactlist')}>
            <FontAwesomeIcon icon={faEnvelopeSolid} />
          </button>
          <button className="icon-button">
            <FontAwesomeIcon icon={faBellSolid} />
          </button>
        </div>
      </header>

      <div className="post-input">
        <img src={user?.avatar || 'default_avatar_url'} alt="avatar" className="avatar" />
        <input
          type="text"
          placeholder="New post..."
          onClick={() => setModalVisible(true)}
          className="post-input-field"
        />
      </div>

      <div className="posts">
        {loading && currentPage === 1 && <div className="loading-spinner">Loading...</div>}
        {posts.map(item => (
          <RenderItem key={item.id} item={item} />
        ))}
        {loading && currentPage > 1 && <div className="loading-spinner">Loading...</div>}
      </div>

      {modalVisible && (
        <div className="modal">
          <div className="modal-content">
          <div className="comment-input-container">
              <textarea
                placeholder="Enter your post content..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="post-textarea"
              />
              <button
                onClick={handlePost}
                className="comment-send-icon"
                disabled={!newPostContent.trim()} 
              >
                <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
            <button onClick={() => setModalVisible(false)} className="close-button">Close</button>
            </div>
        </div>
      )}

      {commentModalVisible && (
        <div className="modal">
          <div className="modal-content">
          <button onClick={() => setCommentModalVisible(false)} className="close-modal-icon"> <FontAwesomeIcon icon={faTimes} /></button>
            <p><strong>Bài viết của {postAuthor}</strong></p>
            <div className="post-content-container">
              <p>{postContent}</p>
            </div>
            <div className="comments">
              {comments.map((comment, index) => (
                <div key={index} className="comment-item">
                  <span className="comment-username">{comment.user.first_name}_{comment.user.last_name}</span>
                  <p>{comment.content}</p>
                </div>
              ))}
            </div>
            <div className="comment-input-container">
              <textarea
                placeholder="Add a comment..."
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                className="comment-textarea"
              />
              <button
                onClick={handlePostComment}
                className="comment-send-icon"
                disabled={!newCommentContent.trim()} // Disable if no content
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
