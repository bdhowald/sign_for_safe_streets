class SearchController < ActionController::API

  # include Response
  # include ExceptionHandler

  # respond_to :json

  def search
    # Set json:api headers
    response.headers['Content-Type'] = 'application/vnd.api+json'


    @results = {}

    search_params = params[:search] || {}

    if search_params[:keywords].present?
      # if Category.find(search_params[:keywords])
    end

    if search_params[:search_term].present?
      @results = Campaign.where('description LIKE :query', query: "%#{search_params[:search_term]}%")
    end

    if search_params[:keywords].present?

      raw_data = Campaign.where('name LIKE :query', query: "%#{search_params[:keywords]}%")

    end

    # format to json:api standard
    formatted_data = raw_data.collect do |campaign|
      {
        id:         campaign.id,
        type:       'campaigns',
        attributes: campaign.attributes
      }
    end

    @results = {
      data: formatted_data
    }

    render json: @results, status: :ok
  end
end