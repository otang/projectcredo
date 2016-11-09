Rails.application.routes.draw do
  root 'homepage#show'

  devise_for :users

  resources :papers, only: [:show, :edit, :update]

  resources :pins, only: [:create, :destroy]

  resources :lists, except: :show do
    resources :references, only: [:show, :create, :destroy]
    resource :vote, controller: 'lists/votes', only: [:create, :destroy]
  end

  resources :references do
    resource :vote, controller: 'references/votes', only: [:create, :destroy]
  end

  resources :comments, only: [:create, :edit, :update, :destroy] do
    resource :vote, controller: 'comments/votes', only: [:create, :destroy]
  end

  get ':username' => 'users/lists#index', as: :user_profile
  get ':username/:id' => 'users/lists#show', as: :user_list
  get ':username/:id/edit' => 'lists#edit', as: :edit_user_list
  get ':username/:id/destroy' => 'lists#destroy', as: :destroy_user_list
  get ':username/:list_id/:id' => 'users/references#show', as: :user_reference
end
