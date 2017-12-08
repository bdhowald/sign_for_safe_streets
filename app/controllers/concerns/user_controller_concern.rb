module UserControllerConcern
  extend ActiveSupport::Concern

  included do
    helper_method :current_user
  end

  def save_current_user

    cu = current_user

    return cu if !cu.new_record?

    user = User.new

    mixpanel_token = "mp_#{Rails.application.secrets.mixpanel[:token]}_mixpanel"

    if cookies[mixpanel_token]
      mixpanel_cookie  = JSON.parse(cookies[mixpanel_token])
      user.mixpanel_id = mixpanel_cookie['distinct_id']
    end

    if cookies['fingerprint_id']
      fingerprint_id       = JSON.parse(cookies['fingerprint_id'])
      user.fingerprint_id = fingerprint_id
    end

    user.save!

  end

  def current_user

    mixpanel_token = "mp_#{Rails.application.secrets.mixpanel[:token]}_mixpanel"

    if cookies[mixpanel_token]
      mixpanel_cookie = JSON.parse(cookies[mixpanel_token])
      mixpanel_id     = mixpanel_cookie['distinct_id']

      if (user = User.find_by(mixpanel_id: mixpanel_id))
        return user
      end

    elsif (user = User.find_by(fingerprint_id: JSON.parse(cookies['fingerprint_id'])))
      return user
    end

    return User.new

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