class Users::ListsController < ApplicationController
  before_action :set_user

  def index
    @lists = @user.lists
  end

  def show
    @list = @user.lists.find_by slug: params[:list_slug]
    @references = @list.references
  end

  private
    def set_user
      @user = User.find_by username: params[:username]
    end
end
