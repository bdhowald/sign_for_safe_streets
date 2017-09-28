class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  def make_it_easy
    @campaigns_by_location = Hash[Campaign.all.group_by(&:borough).sort]
    render
  end
end