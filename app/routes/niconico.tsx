import type { MetaFunction } from "react-router";

import { useCallback, useEffect, useRef, useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Niconico Comment Overlay" },
    {
      content: "Niconico-style scrolling comment overlay",
      name: "description",
    },
  ];
};

interface Comment {
  id: string;
  text: string;
  top: number; // Percentage (10-90)
}

const COMMENTS = [
  // ??????????
  "888888888",
  "88888888",
  "wwwwwwww",
  "wwwww",
  "草",
  "あーあ",
] as const;

const MAX_COMMENTS = 20;
const COMMENT_DURATION_MS = 10000; // 10 seconds to match CSS animation
const MIN_INTERVAL_MS = 2000;
const MAX_INTERVAL_MS = 4000;

export default function Niconico() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeComments, setActiveComments] = useState<Comment[]>([]);
  const nextIdRef = useRef(0);
  const schedulerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const commentTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const clearSchedulerTimeout = useCallback(() => {
    if (schedulerTimeoutRef.current !== null) {
      clearTimeout(schedulerTimeoutRef.current);
      schedulerTimeoutRef.current = null;
    }
  }, []);

  const clearCommentTimeout = useCallback((commentId: string) => {
    const timeoutId = commentTimeoutsRef.current.get(commentId);
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      commentTimeoutsRef.current.delete(commentId);
    }
  }, []);

  const generateRandomComment = useCallback((): Comment => {
    const randomComment = COMMENTS[
      Math.floor(Math.random() * COMMENTS.length)
    ] as string;
    const randomTop = Math.floor(Math.random() * 81) + 10; // 10-90%
    const commentId = nextIdRef.current++;

    return {
      id: `comment-${commentId}`,
      text: randomComment,
      top: randomTop,
    };
  }, []);

  const handleRemoveComment = useCallback(
    (commentId: string) => {
      clearCommentTimeout(commentId);
      setActiveComments((prev) =>
        prev.filter((comment) => comment.id !== commentId),
      );
    },
    [clearCommentTimeout],
  );

  const addComment = useCallback(() => {
    setActiveComments((prev) => {
      if (prev.length >= MAX_COMMENTS) {
        return prev;
      }

      const newComment = generateRandomComment();
      const removalTimeout = setTimeout(() => {
        handleRemoveComment(newComment.id);
      }, COMMENT_DURATION_MS);

      commentTimeoutsRef.current.set(newComment.id, removalTimeout);

      return [...prev, newComment];
    });
  }, [generateRandomComment, handleRemoveComment]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Comment generation effect
  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const scheduleNext = () => {
      clearSchedulerTimeout();

      const randomInterval =
        Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS) + MIN_INTERVAL_MS;

      schedulerTimeoutRef.current = setTimeout(() => {
        addComment();
        scheduleNext();
      }, randomInterval);
    };

    scheduleNext();

    return () => {
      clearSchedulerTimeout();
    };
  }, [isPlaying, addComment, clearSchedulerTimeout]);

  useEffect(() => {
    const timeouts = commentTimeoutsRef.current;

    return () => {
      clearSchedulerTimeout();
      timeouts.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      timeouts.clear();
    };
  }, [clearSchedulerTimeout]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-transparent">
      <style>{`
        @keyframes scroll-comment {
          from {
            transform: translateX(100vw);
          }
          to {
            transform: translateX(-100%);
          }
        }

        .comment-text {
          animation: scroll-comment 10s linear;
          will-change: transform;
          color: #ffffff;
          font-size: 1.5rem;
          font-weight: bold;
          text-shadow:
            -2px -2px 0 #000,
            2px -2px 0 #000,
            -2px 2px 0 #000,
            2px 2px 0 #000;
        }
      `}</style>

      {activeComments.map((comment) => (
        <div
          className="absolute whitespace-nowrap comment-text"
          key={comment.id}
          onAnimationEnd={() => handleRemoveComment(comment.id)}
          style={{ top: `${comment.top}%` }}
        >
          {comment.text}
        </div>
      ))}

      <button
        className="btn btn-primary fixed bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto bg-opacity-50"
        onClick={togglePlayPause}
        type="button"
      >
        {isPlaying ? "Pause Comments" : "Play Comments"}
      </button>
    </div>
  );
}
