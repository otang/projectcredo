class Comments::VotesController < ApplicationController
  before_action :ensure_current_user
  before_action :set_comment

  def create
    current_user.likes @comment
    order_comment @comment

    redirect_to :back
  end

  def destroy
    current_user.unlike @comment
    order_comment @comment

    redirect_to :back
  end

  private
    def votable_params
      params.permit(:id)
    end

    def set_comment
      @comment = Comment.find(votable_params[:id])
    end

    def order_comment comment
      if comment.parent_id
        closest_comment_by_votes = comment.siblings.order("abs(comments.cached_votes_up - #{comment.cached_votes_up})").first
        if comment.cached_votes_up > closest_comment_by_votes.cached_votes_up
          closest_comment_by_votes.prepend_sibling(comment)
        elsif comment.cached_votes_up == closest_comment_by_votes.cached_votes_up
          newest_similar_comment = comment.siblings.where(
            cached_votes_up: closest_comment_by_votes.cached_votes_up).order(created_at: :asc).last
          newest_similar_comment.append_sibling(comment)
        else
          closest_comment_by_votes.append_sibling(comment)
        end
      end
    end
end
