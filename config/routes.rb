Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  get '/', to: 'application#make_it_easy', as: 'homepage'

  post '/review', to: 'application#review'
  get '/review', to: 'application#review'

  post '/sign', to: 'application#sign'

  get 'thank_you', to: 'application#thank_you'

  # get '/campaigns.json', to: 'search#campaigns',
  #   defaults: { format: 'json' }

  # get '/campaigns.html', to: 'search#campaigns',
  #   defaults: { format: 'html' }

  get '/campaigns', to: 'search#campaigns',
    defaults: { format: /html|json/ }

  # get '/categories.json', to: 'search#categories',
  #   defaults: { format: 'json' }

  get '/tags.json', to: 'search#tags',
    defaults: { format: 'json' }

end
