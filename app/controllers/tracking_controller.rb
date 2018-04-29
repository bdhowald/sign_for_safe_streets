class TrackingController < ActionController::Base

  def send_to_mixpanel

    respond_to do |format|
      format.js do
        if (mixpanel_params = params[:mixpanel])
          tracker  = Mixpanel::Tracker.new(Rails.application.secrets.mixpanel[:token])

          event_args = mixpanel_params[:args]

          if event_args.nil?
            tracker.track(params[:id], mixpanel_params[:event])
          else
            new_event_hash = {}
            event_args.each_pair{|k,v|
              new_event_hash[k] = v
            }

            tracker.track(params[:id], mixpanel_params[:event], new_event_hash)
          end

          head :accepted
        else
          head :ok
        end
      end
    end

  end

end