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

    @user = session['user'] || {}

    render

  end


  def sign

    if params['selected_petitions']

      session['selected_petitions'] = JSON.parse(
        params['selected_petitions'] || '[]'
      ).reject{ |i| i.to_i == 0 }

    end

    petitions_to_sign = session['selected_petitions']

    # TODO: redirect long before this
    if petitions_to_sign.empty?
      return redirect_to(homepage_path)
    end

    petitions_to_sign = Campaign.find(petitions_to_sign)


    if params['user']
      session['user'] ||= {}

      session['user']['title']      =  params['user'].try(:[], 'title')
      session['user']['first_name'] =  params['user'].try(:[], 'first_name')
      session['user']['last_name']  =  params['user'].try(:[], 'last_name')
      session['user']['phone']      =  params['user'].try(:[], 'phone')
      session['user']['email']      =  params['user'].try(:[], 'email')

      session['user']['address']  ||= {}

      session['user']['address']['street'] =  params['user'].try(:[], 'address').try(:[], 'street')
      session['user']['address']['city']   =  params['user'].try(:[], 'address').try(:[], 'city')
      session['user']['address']['state']  =  params['user'].try(:[], 'address').try(:[], 'state')
      session['user']['address']['zip']    =  params['user'].try(:[], 'address').try(:[], 'zip')
    end



    trans_alt_url = 'https://campaigns.transalt.org/sites/all/modules/luminate_submit/submit.php'

    responses = {}
    mutex = Mutex.new

    THREAD_COUNT.times.map {
      Thread.new(petitions_to_sign) do |petitions|
        while petition = mutex.synchronize { petitions.pop }

          success = {"success"=>true,
           "message"=>"Success",
           "signerinfo"=>"Brian H. of Brooklyn",
           "loginteraction"=>
            {"code"=>"4",
             "message"=>"Request not allowed from source IP address '104.154.160.53'."},
           "submitsalert"=>
            {"interaction"=>
              {"interactionId"=>"161798",
               "interacted"=>"2017-10-28T17:21:54.370-04:00",
               "alert"=>
                {"alertId"=>"221",
                 "type"=>"action",
                 "status"=>"active",
                 "priority"=>"medium",
                 "url"=>
                  "https://secure.transalt.org/site/Advocacy?pagename=homepage&id=221",
                 "interactionCount"=>"4438",
                 "title"=>"Fix 5th and 6th",
                 "thumbnail"=>{},
                 "internalName"=>
                  "5th and 6th Forward: We Support Bicycle, Pedestrian and Transit Improvements on 5th and 6th Avenues",
                 "description"=>
                  "We support the installation of protected bike lanes and pedestrian safety improvements on 5th and 6th Avenues, starting at 59th Street and continuing south.",
                 "category"=>"General",
                 "issues"=>{"issue"=>"5thand6th"},
                 "restrictByState"=>{},
                 "modified"=>"2016-09-07T11:41:00.000-04:00",
                 "publish"=>"2012-08-01T14:54:41.277-04:00",
                 "expire"=>{},
                 "targets"=>
                  {"target"=>
                    ["Manhattan Community Boards 2, 4 and 5",
                     "Joseph Borelli",
                     "Mitchell Silver"]},
                 "messageSubject"=>"Stand Up for Safer 5th and 6th Avenues",
                 "messageSubjectEditable"=>"optional",
                 "messageGreeting"=>"Dear",
                 "messageOpening"=>{},
                 "messageBody"=>
                  "When you make part of Sixth Avenue safe, don't leave me stranded! Make Fifth Avenue, and the rest of Sixth Avenue, safe with a protected bike lane, too.",
                 "messageBodyEditable"=>"optional",
                 "messageClosing"=>{},
                 "messageSignature"=>"Sincerely,",
                 "letterLimit"=>"0",
                 "wordLimit"=>"0",
                 "position"=>"none",
                 "yeaCount"=>"0",
                 "nayCount"=>"0",
                 "abstainCount"=>"0",
                 "notPresentCount"=>"0"},
               "recipients"=>
                {"recipient"=>
                  {"recipientId"=>"other.110",
                   "title"=>"Council Member",
                   "name"=>"Joseph Borelli",
                   "interactive"=>"false",
                   "deliveryOptions"=>{"delivery"=>["all", "internet", "fax"]},
                   "position"=>"Council Member",
                   "representing"=>{},
                   "party"=>{}}},
               "subject"=>"Fix 5th and 6th",
               "body"=>
                "When you make part of Sixth Avenue safe, don't leave me stranded! Make Fifth Avenue, and the rest of Sixth Avenue, safe with a protected bike lane, too.",
               "called"=>{},
               "contactPosition"=>{},
               "contactName"=>{},
               "reply"=>{},
               "note"=>{}}},
           "outgoingip"=>"10.128.1.14"}

          failure = {"success"=>false,
            "errors"=>{"address"=>"Address is required.", "zip"=>"ZIP code is required."}}

          # res = RestClient.post(
          #   trans_alt_url,
          #   title:      params['title'],
          #   firstname:  params['first_name'],
          #   lastname:   params['last_name'],
          #   email:      params['email'],
          #   address:    params['address'].try(:[], 'street'),
          #   zip:        params['address'].try(:[], 'zip'),
          #   phone:      params['phone'],
          #   city:       params['address'].try(:[], 'city'),
          #   state:      params['address'].try(:[], 'state'),

          #   body:       petition.letter,
          #   subject:    petition.name,
          #   nodeid:     petition.node_id,
          #   alertid:    petition.alert_id,
          #   offlineid:  petition.offline_id,
          #   offlinenum: petition.offline_id
          # )

          res = if Kernel.rand(2) == 1
            success
          else
            failure
          end

          mutex.synchronize { responses[petition.id] = res }

        end
      end
    }.each(&:join)

    if responses.all?{|_, res| res['success']}

      return redirect_to thank_you_path

    else

      @errors = {}
      # populate errors
      responses.each{|k,v| @errors[k] = v['errors'] || []}

      # remember successful signatures
      @successfully_signed_petitions = responses.select{|_, res| res['success']}.keys

      # reload data
      @petitions_to_sign = Campaign.find(session['selected_petitions'])

      @user = session['user'] || {}

      return render 'review'

    end

  end

  def thank_you
    true
  end

end