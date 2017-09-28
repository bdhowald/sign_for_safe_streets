Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  get '/', to: 'application#make_it_easy'

  get '/search.json', to: 'search#search', defaults: { format: 'json' }

end
