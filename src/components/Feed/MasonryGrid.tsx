import React, { useState, useEffect } from 'react';
import { FeedPost } from '../../types';
import FeedCard from './FeedCard';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';

interface MasonryGridProps {
  posts: FeedPost[];
  onLoadMore?: () => void;
  loading?: boolean;
  hasMore?: boolean;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({ 
  posts, 
  onLoadMore, 
  loading = false, 
  hasMore = true 
}) => {
  const [columns, setColumns] = useState<FeedPost[][]>([[], []]);

  const { loadingRef } = useInfiniteScroll({
    hasNextPage: hasMore,
    isFetchingNextPage: loading,
    fetchNextPage: onLoadMore || (() => {}),
    threshold: 200
  });

  useEffect(() => {
    // 重新分配posts到两列，尽量保持高度平衡
    const newColumns: FeedPost[][] = [[], []];
    
    posts.forEach((post, index) => {
      // 简单的交替分配策略
      const columnIndex = index % 2;
      newColumns[columnIndex].push(post);
    });
    
    setColumns(newColumns);
  }, [posts]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {columns.map((columnPosts, columnIndex) => (
          <div key={columnIndex} className="flex flex-col space-y-3 sm:space-y-4">
            {columnPosts.map((post) => (
              <FeedCard key={post.id} post={post} />
            ))}
          </div>
        ))}
      </div>
      
      {/* 无限滚动触发器 */}
      {hasMore && (
        <div 
          ref={loadingRef}
          className="col-span-2 flex justify-center py-4 mt-4"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          ) : (
            <div className="text-gray-400 text-sm">向下滚动加载更多</div>
          )}
        </div>
      )}
      
      {!hasMore && posts.length > 0 && (
        <div className="col-span-2 text-center py-4 text-gray-500 text-sm">
          已加载全部内容
        </div>
      )}
    </>
  );
};

export default MasonryGrid;