class ApplicationController < ActionController::Base

  require 'rest-client'

  # FIX THIS
  protect_from_forgery with: :exception

  helper_method :is_mobile?

  THREAD_COUNT = 8  # tweak this number for maximum performance.

  def make_it_easy
    # @campaigns_by_location = Hash[Campaign.all.group_by(&:borough).sort]

    @campaigns_to_sign = JSON.parse(
      cookies[:campaigns_to_sign] || '[]'
    )

    @campaigns_already_signed = cookies[:campaigns_already_signed] || []

    @campaigns = Campaign.where(is_active: true).sort{|x,y|
      x.name.length <=> y.name.length
    }

    render
  end


  def review

# params["selected_petitions"] = JSON.unparse([2,19,31,39,40,46,53,57,59])

    if params["selected_petitions"]

      session['selected_petitions'] = JSON.parse(
        params["selected_petitions"] || '[]'
      ).reject{ |i| i.to_i == 0 }

    end

    petitions_to_sign = session['selected_petitions']

    if petitions_to_sign.empty?
      return redirect_to(homepage_path)
    end

    @petitions_to_sign = Campaign.find(petitions_to_sign)

    render

  end


  def sign
    byebug
    true

    if params["selected_petitions"]

      session['selected_petitions'] = JSON.parse(
        params["selected_petitions"] || '[]'
      ).reject{ |i| i.to_i == 0 }

    end

    petitions_to_sign = session['selected_petitions']

    # TODO: redirect long before this
    if petitions_to_sign.empty?
      return redirect_to(homepage_path)
    end

    petitions_to_sign = Campaign.find(petitions_to_sign)


    trans_alt_url = 'https://campaigns.transalt.org/sites/all/modules/luminate_submit/submit.php'

    responses = []
    mutex = Mutex.new

    THREAD_COUNT.times.map {
      Thread.new(petitions_to_sign) do |petitions|
        while petition = mutex.synchronize { petitions.pop }

          byebug

          res = RestClient.post(
            trans_alt_url,
            title:      params['title'],
            firstname:  params['first_name'],
            lastname:   params['last_name'],
            email:      params['email'],
            body:       petition.letter,
            subject:    petition.name,
            nodeid:     petition.node_id,
            alertid:    petition.alert_id,
            offlineid:  petition.offline_id,
            offlinenum: petition.offline_id,
            address:    params['address'].try(:[], 'street'),
            zip:        params['address'].try(:[], 'zip'),
            phone:      params['phone'],
            city:       params['address'].try(:[], 'city'),
            state:      params['address'].try(:[], 'state')
          )

          byebug

          mutex.synchronize { responses.push(res) }

          res

        end
      end
    }.each(&:join)

    byebug

    return redirect_to( thank_you_path )
  end

  def thank_you
    true
  end

end