import React, { useState, useEffect, memo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import APIs, { endpoints } from '../configs/APIs';
import { MyUserContext } from '../configs/Contexts';
import './Home.css'; 

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [newCommentContent, setNewCommentContent] = useState("");
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

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleLike = async (postId) => {
    // Implement like functionality here
    console.log(`Liked post with id: ${postId}`);
    // Optionally, you can update the like count here
  };

  const handleShowComments = (postId) => {
    if (selectedPostId === postId) {
      // Toggle comments visibility if the same post is clicked
      setSelectedPostId(null);
      setComments([]);
    } else {
      // Fetch comments for the selected post
      // Example:
      // fetchComments(postId);
      setSelectedPostId(postId);
      // Fetch comments for the selected post
      // setComments(fetchedComments);
    }
  };

  const RenderItem = memo(({ item }) => {
    const [expanded, setExpanded] = useState(false);
    const maxContentHeight = 50;

    return (
      <div key={item.id} className="post-item">
        <div className="account">
          <img src={item.user.avatar} alt="avatar" className="avatar" />
          <span className="username">{item.user.first_name}_{item.user.last_name}</span>
        </div>
        <div className="post-content">
          <span className={expanded ? 'expanded' : ''}>
            {item.content}
          </span>
          {item.content.length > maxContentHeight && !expanded && (
            <button onClick={() => setExpanded(!expanded)} className="read-more">
              Read more
            </button>
          )}
        </div>
        <div className="actions">
          <button onClick={() => handleLike(item.id)} className="like-button">Like</button>
          <button onClick={() => handleShowComments(item.id)} className="comment-button">Comment</button>
        </div>
        <span>{item.like_count} likes • {item.comment_count} comments</span>
        {/* Render comments if this post is selected */}
        {selectedPostId === item.id && (
          <div className="comments">
            {comments.map((comment, index) => (
              <div key={index} className="comment-item">
                <span className="comment-username">{comment.user.first_name}_{comment.user.last_name}</span>
                <p>{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="home-container">
      <header className="header">
        <h1>Home</h1>
        <div className="header-actions">
          <button onClick={handleProfile}>Profile</button>
          {/* Add more actions like notifications, etc. */}
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
            <textarea
              placeholder="Enter your post content..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="modal-textarea"
            />
            <button onClick={handlePost} className="post-button">Post</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
