class SearchController < ActionController::Base

  include UserControllerConcern

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


    respond_to do |format|

      format.html do

        # Set instance variables for view
        @selected_campaigns       = unserialized_campaigns_cookie['selected']
        @campaigns_already_signed = unserialized_campaigns_cookie['already_signed']


        if search_params[:all].present?

          if ActiveRecord::Type::Boolean.new.cast(search_params[:all])

            @search_term = search_params[:all]

            active_campaigns = Campaign.where(is_active: true)

            render(
              partial: 'application/results',
              layout: false,
              locals: {
                campaigns: active_campaigns,
                other_campaigns: []
              }
            )

          end

        elsif search_params[:name].present?

          campaign = Campaign.active.where(
            name: search_params[:name]
          )

          other_campaigns = Campaign.active.where
            .not(
              name: search_params[:name]
            )

          if campaign

            @search_term = search_params[:name]

            render(
              partial: 'application/results',
              layout: false,
              locals: {
                campaigns: campaign,
                other_campaigns: other_campaigns
              }
            )
          else
            return head :ok
          end

        elsif search_params[:search_term]

          matching_tags = Tag.search_full_text(search_params[:search_term])

          matching_campaigns = matching_tags.present? ?
            Campaign.find(matching_tags.collect(&:campaign_ids).inject(:&)) :
            []

          @search_term = search_params[:search_term]

          render(
            partial: 'application/results',
            layout: false,
            locals: {
              campaigns: matching_campaigns.sort{ |x,y|
                x.name.length <=> y.name.length
              },
              other_campaigns: Campaign.active - matching_campaigns
            }
          )

        end

      end

      format.json do

        # Set json:api headers
        response.headers['Content-Type'] = 'application/vnd.api+json'

        if search_params[:suggestion].present?
          campaigns = Campaign.search_full_text(search_params[:suggestion])
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

    if search_params[:suggestion].present?
      tags = Tag.search_full_text(
        search_params[:suggestion]
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