class TrackingController < ActionController::Base

  include UserControllerConcern

  def send_to_mixpanel

    if (mixpanel_params = params[:mixpanel])
      tracker  = Mixpanel::Tracker.new(Rails.application.secrets.mixpanel[:token])

      event_args = mixpanel_params[:args]

      if event_args == ''
        event_args = {}
      else
        new_hash = {}
        event_args.each_pair{|k,v|
          new_hash[k] = v
        }
        event_args = new_hash
      end

      tracker.track(params[:id], mixpanel_params[:event], event_args)
    end

    return :ok

  end

end