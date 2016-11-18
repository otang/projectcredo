Rails.application.routes.draw do
  root 'homepage#show'

  devise_for :users

  resources :papers, only: [:show, :edit, :update] do
    resources :links, only: :destroy, shallow: true
  end

  resources :pins, only: [:create, :destroy]

  resources :lists, only: [:index, :new, :create] do
    resources :references, only: [:show, :create, :destroy]
    resource :vote, controller: 'lists/votes', only: [:create, :destroy]
  end

  resources :references do
    resource :vote, controller: 'references/votes', only: [:create, :destroy]
  end

  resources :comments, only: [:create, :edit, :update, :destroy] do
    resource :vote, controller: 'comments/votes', only: [:create, :destroy]
  end

  scope ':username' do
    resources :lists, path: '/', except: [:new, :create], as: :user_lists, controller: 'users/lists'
    get ':user_list_id/:id' => 'references#show', as: :user_list_reference
  end

end
