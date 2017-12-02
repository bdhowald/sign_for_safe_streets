module UserControllerConcern
  extend ActiveSupport::Concern

  MOVE_THIS = "mp_3f9ed715a30d310093e324e07cac1f30_mixpanel"

  included do
    helper_method :current_user
  end

  def current_user
    if cookies[MOVE_THIS]
      mixpanel_cookie = JSON.parse(cookies[MOVE_THIS])
      user = User.new(mixpanel_cookie['distinct_id'])
    end
  end

  def unserialize_hash(serialized_hash)
    if serialized_hash
      JSON.parse(serialized_hash)
    else
      nil
    end
  end

  def unserialized_campaigns_cookie
    unserialize_hash(cookies['campaigns']) || {}
  end

end