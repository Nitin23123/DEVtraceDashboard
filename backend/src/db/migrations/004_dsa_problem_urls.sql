-- Migration: 004_dsa_problem_urls.sql
-- Adds url column to dsa_problems and populates canonical LeetCode links

ALTER TABLE dsa_problems ADD COLUMN IF NOT EXISTS url TEXT;

-- Day 1: Arrays
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/two-sum/' WHERE day_number = 1 AND title = 'Two Sum';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' WHERE day_number = 1 AND title = 'Best Time to Buy and Sell Stock';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/contains-duplicate/' WHERE day_number = 1 AND title = 'Contains Duplicate';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/maximum-subarray/' WHERE day_number = 1 AND title = 'Maximum Subarray';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/move-zeroes/' WHERE day_number = 1 AND title = 'Move Zeroes';

-- Day 2: Arrays Hard
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/3sum/' WHERE day_number = 2 AND title = '3Sum';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/container-with-most-water/' WHERE day_number = 2 AND title = 'Container With Most Water';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/trapping-rain-water/' WHERE day_number = 2 AND title = 'Trapping Rain Water';

-- Day 3: Hashing
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/group-anagrams/' WHERE day_number = 3 AND title = 'Group Anagrams';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/top-k-frequent-elements/' WHERE day_number = 3 AND title = 'Top K Frequent Elements';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/longest-consecutive-sequence/' WHERE day_number = 3 AND title = 'Longest Consecutive Sequence';

-- Day 4: Linked List
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/reverse-linked-list/' WHERE day_number = 4 AND title = 'Reverse Linked List';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/merge-two-sorted-lists/' WHERE day_number = 4 AND title = 'Merge Two Sorted Lists';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/linked-list-cycle/' WHERE day_number = 4 AND title = 'Linked List Cycle';

-- Day 5: Linked List Advanced
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' WHERE day_number = 5 AND title = 'Remove Nth Node From End of List';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/reorder-list/' WHERE day_number = 5 AND title = 'Reorder List';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/lru-cache/' WHERE day_number = 5 AND title = 'LRU Cache';

-- Day 6: Two Pointers
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/valid-palindrome/' WHERE day_number = 6 AND title = 'Valid Palindrome';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/3sum/' WHERE day_number = 6 AND title = '3Sum';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/' WHERE day_number = 6 AND title = 'Remove Duplicates from Sorted Array';

-- Day 7: Sliding Window
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' WHERE day_number = 7 AND title = 'Best Time to Buy and Sell Stock';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' WHERE day_number = 7 AND title = 'Longest Substring Without Repeating Characters';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/minimum-window-substring/' WHERE day_number = 7 AND title = 'Minimum Window Substring';

-- Day 8: Stack
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/valid-parentheses/' WHERE day_number = 8 AND title = 'Valid Parentheses';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/min-stack/' WHERE day_number = 8 AND title = 'Min Stack';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/daily-temperatures/' WHERE day_number = 8 AND title = 'Daily Temperatures';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/largest-rectangle-in-histogram/' WHERE day_number = 8 AND title = 'Largest Rectangle in Histogram';

-- Day 9: Queue Monotonic
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/sliding-window-maximum/' WHERE day_number = 9 AND title = 'Sliding Window Maximum';
-- Note: 'Implement Queue using Two Stacks' left NULL
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/decode-string/' WHERE day_number = 9 AND title = 'Decode String';

-- Day 10: Binary Search
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/binary-search/' WHERE day_number = 10 AND title = 'Binary Search';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/search-in-rotated-sorted-array/' WHERE day_number = 10 AND title = 'Search in Rotated Sorted Array';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' WHERE day_number = 10 AND title = 'Find Minimum in Rotated Sorted Array';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/time-based-key-value-store/' WHERE day_number = 10 AND title = 'Time Based Key-Value Store';

-- Day 11: Recursion Backtracking
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/subsets/' WHERE day_number = 11 AND title = 'Subsets';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/combination-sum/' WHERE day_number = 11 AND title = 'Combination Sum';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/permutations/' WHERE day_number = 11 AND title = 'Permutations';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/word-search/' WHERE day_number = 11 AND title = 'Word Search';

-- Day 12: Divide and Conquer
-- Note: 'Merge Sort' and 'Quick Sort' left NULL
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/kth-largest-element-in-an-array/' WHERE day_number = 12 AND title = 'Kth Largest Element in an Array';

-- Day 13: Greedy
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/jump-game/' WHERE day_number = 13 AND title = 'Jump Game';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/jump-game-ii/' WHERE day_number = 13 AND title = 'Jump Game II';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/gas-station/' WHERE day_number = 13 AND title = 'Gas Station';

-- Day 14: Bit Manipulation
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/single-number/' WHERE day_number = 14 AND title = 'Single Number';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/number-of-1-bits/' WHERE day_number = 14 AND title = 'Number of 1 Bits';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/counting-bits/' WHERE day_number = 14 AND title = 'Counting Bits';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/reverse-bits/' WHERE day_number = 14 AND title = 'Reverse Bits';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/missing-number/' WHERE day_number = 14 AND title = 'Missing Number';

-- Day 15: Trees Basic
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/invert-binary-tree/' WHERE day_number = 15 AND title = 'Invert Binary Tree';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' WHERE day_number = 15 AND title = 'Maximum Depth of Binary Tree';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/diameter-of-binary-tree/' WHERE day_number = 15 AND title = 'Diameter of Binary Tree';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/balanced-binary-tree/' WHERE day_number = 15 AND title = 'Balanced Binary Tree';

-- Day 16: Trees Traversal
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/binary-tree-level-order-traversal/' WHERE day_number = 16 AND title = 'Binary Tree Level Order Traversal';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/' WHERE day_number = 16 AND title = 'Binary Tree Zigzag Level Order Traversal';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/binary-tree-right-side-view/' WHERE day_number = 16 AND title = 'Binary Tree Right Side View';

-- Day 17: BST
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/validate-binary-search-tree/' WHERE day_number = 17 AND title = 'Validate Binary Search Tree';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/' WHERE day_number = 17 AND title = 'Lowest Common Ancestor of BST';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/' WHERE day_number = 17 AND title = 'Kth Smallest Element in a BST';

-- Day 18: Tries
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/implement-trie-prefix-tree/' WHERE day_number = 18 AND title = 'Implement Trie';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/design-add-and-search-words-data-structure/' WHERE day_number = 18 AND title = 'Add and Search Word';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/word-search-ii/' WHERE day_number = 18 AND title = 'Word Search II';

-- Day 19: Heap Priority Queue
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/kth-largest-element-in-a-stream/' WHERE day_number = 19 AND title = 'Kth Largest Element in a Stream';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/last-stone-weight/' WHERE day_number = 19 AND title = 'Last Stone Weight';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/k-closest-points-to-origin/' WHERE day_number = 19 AND title = 'K Closest Points to Origin';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/task-scheduler/' WHERE day_number = 19 AND title = 'Task Scheduler';

-- Day 20: Graph BFS DFS
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/number-of-islands/' WHERE day_number = 20 AND title = 'Number of Islands';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/clone-graph/' WHERE day_number = 20 AND title = 'Clone Graph';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/max-area-of-island/' WHERE day_number = 20 AND title = 'Max Area of Island';

-- Day 21: Graph Advanced
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/course-schedule/' WHERE day_number = 21 AND title = 'Course Schedule';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/pacific-atlantic-water-flow/' WHERE day_number = 21 AND title = 'Pacific Atlantic Water Flow';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/surrounded-regions/' WHERE day_number = 21 AND title = 'Surrounded Regions';

-- Day 22: Dynamic Programming
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/climbing-stairs/' WHERE day_number = 22 AND title = 'Climbing Stairs';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/coin-change/' WHERE day_number = 22 AND title = 'Coin Change';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/longest-increasing-subsequence/' WHERE day_number = 22 AND title = 'Longest Increasing Subsequence';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/unique-paths/' WHERE day_number = 22 AND title = 'Unique Paths';

-- Day 23: DP 2D Advanced
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/longest-common-subsequence/' WHERE day_number = 23 AND title = 'Longest Common Subsequence';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/edit-distance/' WHERE day_number = 23 AND title = 'Edit Distance';
UPDATE dsa_problems SET url = 'https://leetcode.com/problems/burst-balloons/' WHERE day_number = 23 AND title = 'Burst Balloons';