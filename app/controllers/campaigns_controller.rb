class CampaignsController < ActionController::Base

  include UserControllerConcern

  def show

      @campaign = Campaign.find_by(link: "/petition/#{params[:id]}")
      @campaign ||= Campaign.find(params[:id])

    respond_to do |format|
      format.html do
        render 'campaigns/show', layout: 'application'
      end
    end
  end

end