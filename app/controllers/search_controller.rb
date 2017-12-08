class SearchController < ActionController::Base

  include UserControllerConcern

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

        query_type  = search_params[:query_type] || 'all'
        query_terms = search_params[:query_value]


        case query_type
          when 'all'
            @search_term = nil

            matching_campaigns = Campaign.where(is_active: true)

          when 'name'
            @search_term = query_terms

            matching_campaigns = Campaign.active.where(
              name: query_terms
            )

          when 'keywords'
            @search_term = query_terms

            matching_campaigns = Campaign.search_full_text(query_terms)
        end


        if location_filters
          locations              = location_filters.map{|loc| loc.split.map(&:capitalize).join(' ')}
          @location_filter_terms = locations

          matching_campaigns     = matching_campaigns.where(borough: locations)
        end


        if category_filters

          categories             = Category.where(name: category_filters)
          @category_filter_terms = categories.collect{|cat| cat.name.split.map(&:capitalize).join(' ')}

          matching_campaigns = matching_campaigns.where(id: categories.collect(&:campaign_ids).flatten.uniq)

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