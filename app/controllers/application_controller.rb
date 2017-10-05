class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  def make_it_easy
    # @campaigns_by_location = Hash[Campaign.all.group_by(&:borough).sort]

    @campaigns_to_sign = JSON.parse(
      cookies[:campaigns_to_sign] || '[]'
    )

    @campaigns_already_signed = cookies[:campaigns_already_signed] || []

    @campaigns = Campaign.all.sort{|x,y|
      x.name.length <=> y.name.length
    }

    render
  end
end