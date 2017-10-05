class SearchController < ActionController::Base

  require 'lingua/stemmer'

  # include Response
  # include ExceptionHandler

  # respond_to :json

  # def search
  #   # Set json:api headers
  #   response.headers['Content-Type'] = 'application/vnd.api+json'


  #   @results = {}

  #   search_params = params[:search] || {}

  #   if search_params[:keywords].present?
  #     # if Category.find(search_params[:keywords])
  #   end

  #   if search_params[:suggestion].present?
  #     campaigns = Campaign.where(
  #       'description LIKE :query',
  #       query: "%#{search_params[:suggestion]}%"
  #     ).collect do |campaign|
  #     {
  #       id:         campaign.id,
  #       type:       'campaigns',
  #       attributes: campaign.attributes
  #     }

  #   end

  #   if search_params[:keywords].present?

  #     raw_data = Campaign.where('name LIKE :query', query: "%#{search_params[:keywords]}%")

  #   end

  #   # format to json:api standard
  #   formatted_data = raw_data

  #   @results = {
  #     data: formatted_data
  #   }

  #   render json: @results, status: :ok
  # end


  def campaigns

    search_params = params[:search] || {}

    stemmer ||= Lingua::Stemmer.new(:language => "en")


    respond_to do |format|

      format.html do

        if search_params[:name].present?

          campaign = Campaign.find_by(
            name: search_params[:name]
          )

          if campaign
            # render(
            #   partial: 'application/campaign',
            #   layout: false,
            #   locals: {campaign: campaign}
            # )

            render(
              partial: 'application/results',
              layout: false,
              locals: {camapigns: [campaign]}
            )
          else
            return head :ok
          end

        elsif search_params[:search_term]

          tag = Tag.find_by(
            word: search_params[:search_term]
          ) || Tag.find_by(
            word: stemmer.stem(search_params[:search_term])
          )


          if tag && tag.campaigns.present?
            # render(
            #   partial: 'application/campaign',
            #   layout: false,
            #   collection: tag.campaigns.sort{ |x,y|
            #     x.name.length <=> y.name.length
            #   }, as: campaign
            # )

            render(
              partial: 'application/results',
              layout: false,
              locals: {
                campaigns: tag.campaigns.sort{ |x,y|
                  x.name.length <=> y.name.length
                },
                other_campaigns: []
              }
            )
          end



        end

      end

      format.json do

        stemmer ||= Lingua::Stemmer.new(:language => "en")

        # Set json:api headers
        response.headers['Content-Type'] = 'application/vnd.api+json'

        if search_params[:suggestion].present?
          campaigns = Campaign.where(
            'description LIKE :query OR description LIKE :stem',
            query: "%#{search_params[:suggestion]}%",
            stem:  "%#{stemmer.stem(search_params[:suggestion])}"
          )
        end

        @results = {
          data: (campaigns || []).collect do |campaign|
            {
              id:         campaign.id,
              type:       'campaigns',
              attributes: campaign.attributes
            }
          end
        }

        render json: @results, status: :ok

      end

    end

  end


  # def categories
  #   # Set json:api headers
  #   response.headers['Content-Type'] = 'application/vnd.api+json'

  #   search_params = params[:search] || {}

  #   if search_params[:suggestion].present?
  #     categories = Category.where(
  #       'name LIKE :query',
  #       query: "%#{search_params[:suggestion]}%"
  #     ).collect do |category|
  #       {
  #         id:         category.id,
  #         type:       'categories',
  #         attributes: category.attributes
  #       }
  #     end
  #   end

  #   @results = {
  #     data: categories
  #   }

  #   render json: @results, status: :ok
  # end


  def tags
    # Set json:api headers
    response.headers['Content-Type'] = 'application/vnd.api+json'

    search_params = params[:search] || {}

    stemmer ||= Lingua::Stemmer.new(:language => "en")

    if search_params[:suggestion].present?
      tags = Tag.where(
        'word LIKE :query OR word LIKE :stem',
        query: "%#{search_params[:suggestion]}%",
        stem:  "%#{stemmer.stem(search_params[:suggestion])}"
      ).collect do |tag|
        {
          id:         tag.id,
          type:       'tags',
          attributes: tag.attributes
        }
      end
    end

    @results = {
      data: tags
    }

    render json: @results, status: :ok
  end

end