Rails.application.routes.draw do
  namespace :admin do
    resources :campaigns
    resources :categories
    resources :regions
    resources :tags
    resources :users

    root to: "campaigns#index"
  end

  Region.all.each do |reg|
    get "/#{reg.alias}", to: 'application#region', reg_alias: "#{reg.alias}"
  end

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  get '/', to: 'application#index', as: 'homepage'

  get '/acknowledgments', to: 'application#acknowledgments'

  get '/privacy', to: 'application#privacy'

  post '/review', to: 'application#review'
  get '/review', to: 'application#review'

  get '/sign', to: 'application#sign'
  post '/sign', to: 'application#sign'

  get 'thank_you', to: 'application#thank_you'

  # get '/campaigns.json', to: 'search#campaigns',
  #   defaults: { format: 'json' }

  # get '/campaigns.html', to: 'search#campaigns',
  #   defaults: { format: 'html' }

  resources :campaigns, only: [:show]

  resources :regions

  get '/campaigns', to: 'search#campaigns',
    defaults: { format: /html|json/ }

  # get '/categories.json', to: 'search#categories',
  #   defaults: { format: 'json' }

  get '/tags.json', to: 'search#tags',
    defaults: { format: 'json' }

  put '/tracking/:id(.:format)', to: 'tracking#send_to_mixpanel'

end
