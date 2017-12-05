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

    search_params  = params[:search] || {}
    search_filters = params[:filters] || {}

    if (cat_filters = search_filters[:categories])
      category_filters = JSON.parse(cat_filters)
    end
    if (loc_filters = search_filters[:locations])
      location_filters = JSON.parse(loc_filters)
    end

    @search_term


    respond_to do |format|

      format.html do

        # Set instance variables for view
        @selected_campaigns       = unserialized_campaigns_cookie['selected']
        @campaigns_already_signed = unserialized_campaigns_cookie['already_signed']


        if search_params[:all].present?

          if ActiveRecord::Type::Boolean.new.cast(search_params[:all])

            @search_term = nil

            matching_campaigns = Campaign.where(is_active: true)

          end


        elsif search_params[:name].present?

          @search_term = search_params[:name]

          matching_campaigns = Campaign.active.where(
            name: search_params[:name]
          )

        elsif search_params[:search_term]

          @search_term = search_params[:search_term]

          matching_campaigns = Campaign.search_full_text(search_params[:search_term])

        end

        if location_filters
          locations              = location_filters.map{|loc| loc.split.map(&:capitalize).join(' ')}
          @location_filter_terms = locations

          matching_campaigns     = matching_campaigns.where(borough: locations)
        end

        if category_filters

          categories             = Category.where(name: category_filters)
          @category_filter_terms = categories.collect{|cat| cat.name.split.map(&:capitalize).join(' ')}

          cat_tag_ids = categories.collect(&:tag_ids).flatten.uniq

          matching_campaigns = matching_campaigns.select do |cp|
            cp_tag_ids = cp.tag_ids
            !(cp_tag_ids & cat_tag_ids).empty?
          end

        end


        render(
          partial: 'application/results',
          layout: false,
          locals: {
            campaigns: matching_campaigns.sort{ |x,y|
              x.name.length <=> y.name.length
            },
            other_campaigns: Campaign.where.not(id: matching_campaigns.collect(&:id))
          }
        )

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