/**
 * Post Module - Posts, comments, feed management and news
 * Public interface for all post-related functionality
 */

// Services
export { postService } from './postService.js';
export { postRepository } from './postRepository.js';

// State management
export { 
  getPosts, 
  setPosts, 
  addPost, 
  deletePost,
  getComments,
  setComments,
  subscribeToPostChanges 
} from './postState.js';

// UI Managers
export { PostManager } from './PostManager.js';
export { FeedRenderer } from './FeedRenderer.js';
export { FeedControlsManager } from './FeedControlsManager.js';
export { FilterManager } from './FilterManager.js';
export { NewsManager } from './NewsManager.js';
export { SearchManager } from './SearchManager.js';
export { TabManager } from './TabManager.js';

// Services
export { CommentService } from './CommentService.js';

// Mock data
export { MockNews } from './MockNews.js';
