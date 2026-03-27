-- Migration: 003_developer_tools.sql
-- Adds developer tools schema: pinned column on tasks, snippets table,
-- dsa_problems table with seed data, and user_dsa_progress table.

-- 1. Add pinned column to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Snippets table
CREATE TABLE IF NOT EXISTS snippets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  language VARCHAR(50) NOT NULL DEFAULT 'Other',
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_snippets_user_id ON snippets(user_id);

-- 3. DSA problems table
CREATE TABLE IF NOT EXISTS dsa_problems (
  id SERIAL PRIMARY KEY,
  day_number INTEGER NOT NULL,
  topic VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard'))
);

-- 4. User DSA progress table
CREATE TABLE IF NOT EXISTS user_dsa_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id INTEGER NOT NULL REFERENCES dsa_problems(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (user_id, problem_id)
);
CREATE INDEX IF NOT EXISTS idx_user_dsa_progress_user_id ON user_dsa_progress(user_id);

-- 5. Unique constraint on dsa_problems to allow idempotent re-runs
-- PG 15 does not support "ADD CONSTRAINT IF NOT EXISTS", so use a DO block
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'dsa_problems_day_title_unique'
      AND conrelid = 'dsa_problems'::regclass
  ) THEN
    ALTER TABLE dsa_problems ADD CONSTRAINT dsa_problems_day_title_unique UNIQUE (day_number, title);
  END IF;
END$$;

-- 6. DSA seed data (79 problems across 23 days)
INSERT INTO dsa_problems (day_number, topic, title, difficulty) VALUES
-- Day 1: Arrays (5 problems)
(1, 'Arrays', 'Two Sum', 'Easy'),
(1, 'Arrays', 'Best Time to Buy and Sell Stock', 'Easy'),
(1, 'Arrays', 'Contains Duplicate', 'Easy'),
(1, 'Arrays', 'Maximum Subarray', 'Medium'),
(1, 'Arrays', 'Move Zeroes', 'Easy'),
-- Day 2: Arrays Hard (3 problems)
(2, 'Arrays Hard', '3Sum', 'Medium'),
(2, 'Arrays Hard', 'Container With Most Water', 'Medium'),
(2, 'Arrays Hard', 'Trapping Rain Water', 'Hard'),
-- Day 3: Hashing (3 problems)
(3, 'Hashing', 'Group Anagrams', 'Medium'),
(3, 'Hashing', 'Top K Frequent Elements', 'Medium'),
(3, 'Hashing', 'Longest Consecutive Sequence', 'Medium'),
-- Day 4: Linked List (3 problems)
(4, 'Linked List', 'Reverse Linked List', 'Easy'),
(4, 'Linked List', 'Merge Two Sorted Lists', 'Easy'),
(4, 'Linked List', 'Linked List Cycle', 'Easy'),
-- Day 5: Linked List Advanced (3 problems)
(5, 'Linked List Advanced', 'Remove Nth Node From End of List', 'Medium'),
(5, 'Linked List Advanced', 'Reorder List', 'Medium'),
(5, 'Linked List Advanced', 'LRU Cache', 'Medium'),
-- Day 6: Two Pointers (3 problems)
(6, 'Two Pointers', 'Valid Palindrome', 'Easy'),
(6, 'Two Pointers', '3Sum', 'Medium'),
(6, 'Two Pointers', 'Remove Duplicates from Sorted Array', 'Easy'),
-- Day 7: Sliding Window (3 problems)
(7, 'Sliding Window', 'Best Time to Buy and Sell Stock', 'Easy'),
(7, 'Sliding Window', 'Longest Substring Without Repeating Characters', 'Medium'),
(7, 'Sliding Window', 'Minimum Window Substring', 'Hard'),
-- Day 8: Stack (4 problems)
(8, 'Stack', 'Valid Parentheses', 'Easy'),
(8, 'Stack', 'Min Stack', 'Medium'),
(8, 'Stack', 'Daily Temperatures', 'Medium'),
(8, 'Stack', 'Largest Rectangle in Histogram', 'Hard'),
-- Day 9: Queue Monotonic (3 problems)
(9, 'Queue Monotonic', 'Sliding Window Maximum', 'Hard'),
(9, 'Queue Monotonic', 'Implement Queue using Two Stacks', 'Easy'),
(9, 'Queue Monotonic', 'Decode String', 'Medium'),
-- Day 10: Binary Search (4 problems)
(10, 'Binary Search', 'Binary Search', 'Easy'),
(10, 'Binary Search', 'Search in Rotated Sorted Array', 'Medium'),
(10, 'Binary Search', 'Find Minimum in Rotated Sorted Array', 'Medium'),
(10, 'Binary Search', 'Time Based Key-Value Store', 'Medium'),
-- Day 11: Recursion Backtracking (4 problems)
(11, 'Recursion Backtracking', 'Subsets', 'Medium'),
(11, 'Recursion Backtracking', 'Combination Sum', 'Medium'),
(11, 'Recursion Backtracking', 'Permutations', 'Medium'),
(11, 'Recursion Backtracking', 'Word Search', 'Medium'),
-- Day 12: Divide and Conquer (3 problems)
(12, 'Divide and Conquer', 'Merge Sort', 'Medium'),
(12, 'Divide and Conquer', 'Quick Sort', 'Medium'),
(12, 'Divide and Conquer', 'Kth Largest Element in an Array', 'Medium'),
-- Day 13: Greedy (3 problems)
(13, 'Greedy', 'Jump Game', 'Medium'),
(13, 'Greedy', 'Jump Game II', 'Medium'),
(13, 'Greedy', 'Gas Station', 'Medium'),
-- Day 14: Bit Manipulation (5 problems)
(14, 'Bit Manipulation', 'Single Number', 'Easy'),
(14, 'Bit Manipulation', 'Number of 1 Bits', 'Easy'),
(14, 'Bit Manipulation', 'Counting Bits', 'Easy'),
(14, 'Bit Manipulation', 'Reverse Bits', 'Easy'),
(14, 'Bit Manipulation', 'Missing Number', 'Easy'),
-- Day 15: Trees Basic (4 problems)
(15, 'Trees Basic', 'Invert Binary Tree', 'Easy'),
(15, 'Trees Basic', 'Maximum Depth of Binary Tree', 'Easy'),
(15, 'Trees Basic', 'Diameter of Binary Tree', 'Easy'),
(15, 'Trees Basic', 'Balanced Binary Tree', 'Easy'),
-- Day 16: Trees Traversal (3 problems)
(16, 'Trees Traversal', 'Binary Tree Level Order Traversal', 'Medium'),
(16, 'Trees Traversal', 'Binary Tree Zigzag Level Order Traversal', 'Medium'),
(16, 'Trees Traversal', 'Binary Tree Right Side View', 'Medium'),
-- Day 17: BST (3 problems)
(17, 'BST', 'Validate Binary Search Tree', 'Medium'),
(17, 'BST', 'Lowest Common Ancestor of BST', 'Medium'),
(17, 'BST', 'Kth Smallest Element in a BST', 'Medium'),
-- Day 18: Tries (3 problems)
(18, 'Tries', 'Implement Trie', 'Medium'),
(18, 'Tries', 'Add and Search Word', 'Medium'),
(18, 'Tries', 'Word Search II', 'Hard'),
-- Day 19: Heap Priority Queue (4 problems)
(19, 'Heap Priority Queue', 'Kth Largest Element in a Stream', 'Easy'),
(19, 'Heap Priority Queue', 'Last Stone Weight', 'Easy'),
(19, 'Heap Priority Queue', 'K Closest Points to Origin', 'Medium'),
(19, 'Heap Priority Queue', 'Task Scheduler', 'Medium'),
-- Day 20: Graph BFS DFS (3 problems)
(20, 'Graph BFS DFS', 'Number of Islands', 'Medium'),
(20, 'Graph BFS DFS', 'Clone Graph', 'Medium'),
(20, 'Graph BFS DFS', 'Max Area of Island', 'Medium'),
-- Day 21: Graph Advanced (3 problems)
(21, 'Graph Advanced', 'Course Schedule', 'Medium'),
(21, 'Graph Advanced', 'Pacific Atlantic Water Flow', 'Medium'),
(21, 'Graph Advanced', 'Surrounded Regions', 'Medium'),
-- Day 22: Dynamic Programming (4 problems)
(22, 'Dynamic Programming', 'Climbing Stairs', 'Easy'),
(22, 'Dynamic Programming', 'Coin Change', 'Medium'),
(22, 'Dynamic Programming', 'Longest Increasing Subsequence', 'Medium'),
(22, 'Dynamic Programming', 'Unique Paths', 'Medium'),
-- Day 23: DP 2D Advanced (3 problems)
(23, 'DP 2D Advanced', 'Longest Common Subsequence', 'Medium'),
(23, 'DP 2D Advanced', 'Edit Distance', 'Medium'),
(23, 'DP 2D Advanced', 'Burst Balloons', 'Hard')
ON CONFLICT DO NOTHING;
