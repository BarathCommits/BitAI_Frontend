/**
 * Message Feedback Component
 * 
 * Allows users to provide feedback on AI chat messages with:
 * - Star rating (1-5 stars)
 * - Optional detailed text feedback
 * - Submission to backend for analytics
 * 
 * Used in ChatPage to collect user feedback on AI responses.
 */
import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Icons } from '../../utils/iconUtils';
import { chatSessionService } from '../../services/ChatSessionService';
import toast from 'react-hot-toast';

const { Star, ThumbsUp, ThumbsDown } = Icons;

interface MessageFeedbackProps {
  messageId: string;
  onFeedbackSubmitted?: () => void;
}

export const MessageFeedback: React.FC<MessageFeedbackProps> = ({
  messageId,
  onFeedbackSubmitted,
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const handleRatingClick = async (selectedRating: number) => {
    if (isSubmitting) return;
    
    setRating(selectedRating);
    setIsSubmitting(true);

    try {
      const result = await chatSessionService.submitFeedback(messageId, selectedRating);
      
      if (result.success) {
        toast.success('Thank you for your feedback!');
        onFeedbackSubmitted?.();
      } else {
        // Show appropriate error message
        const errorMessage = result.error?.message || 'Failed to submit feedback. Please try again.';
        toast.error(errorMessage);
        setRating(null);
      }
    } catch (error) {
      // Show error message on network failures
      toast.error('Unable to submit feedback. Please check your connection and try again.');
      setRating(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetailedFeedback = async () => {
    if (!rating || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const result = await chatSessionService.submitFeedback(
        messageId,
        rating,
        feedback.trim() || undefined
      );
      
      if (result.success) {
        toast.success('Thank you for your detailed feedback!');
        setShowFeedbackForm(false);
        setFeedback('');
        onFeedbackSubmitted?.();
      } else {
        // Show appropriate error message
        const errorMessage = result.error?.message || 'Failed to submit feedback. Please try again.';
        toast.error(errorMessage);
      }
    } catch (error) {
      // Show error message on network failures
      toast.error('Unable to submit feedback. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (rating !== null && !showFeedbackForm) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRatingClick(star)}
              disabled={isSubmitting}
              className={`${
                star <= rating
                  ? 'text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-300'
              } transition-colors`}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500">Thank you!</span>
        <button
          onClick={() => setShowFeedbackForm(true)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Add details
        </button>
      </div>
    );
  }

  if (showFeedbackForm) {
    return (
      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`${
                star <= (rating || 0)
                  ? 'text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-300'
              } transition-colors`}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>
          ))}
        </div>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Tell us more about your experience (optional)..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          rows={3}
        />
        <div className="flex items-center gap-2 mt-2">
          <Button
            onClick={handleDetailedFeedback}
            disabled={!rating || isSubmitting}
            size="sm"
          >
            Submit
          </Button>
          <Button
            onClick={() => {
              setShowFeedbackForm(false);
              setFeedback('');
              if (rating === null) {
                setRating(null);
              }
            }}
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-xs text-gray-500">Was this helpful?</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRatingClick(star)}
            disabled={isSubmitting}
            className="text-gray-300 hover:text-yellow-400 transition-colors"
          >
            <Star className="w-4 h-4" />
          </button>
        ))}
      </div>
      <button
        onClick={() => setShowFeedbackForm(true)}
        className="text-xs text-gray-500 hover:text-gray-700"
      >
        Provide detailed feedback
      </button>
    </div>
  );
};

