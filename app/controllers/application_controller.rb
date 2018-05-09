class ApplicationController < ActionController::Base

  require 'rest-client'

  include UserControllerConcern


  protect_from_forgery with: :exception

  THREAD_COUNT = 8  # tweak this number for maximum performance.


  def index
    # TODO: hacky, replace ASAP
    cookies['petition_mode'] = serialize_hash('false')

    @view_style = unserialize_hash(cookies['view_style']) || 'grid'

    if !(campaignData = unserialized_campaigns_cookie).empty?
      @selected_campaigns       = campaignData['selected']
      @campaigns_already_signed = campaignData['already_signed']
    end


    @campaigns =
      if (@search_term = params['search-term']).present?
        Campaign.active.search_full_text(@search_term)
      elsif (campaign_ids = params['campaigns'].present? && params['campaigns'].reject{|id| (id =~ /\A[-+]?[0-9]*\.?[0-9]+\Z/).nil?}).present?
        Campaign.active.where(id: campaign_ids)
      else
        Campaign.active
      end

    @other_campaigns  = Campaign.active.where.not(id: @campaigns.collect(&:id))


    response.headers["Cache-Control"] = "no-cache, no-store, max-age=0, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "Fri, 01 Jan 1990 00:00:00 GMT"

    render
  end


  def region
    @region = Region.find_by(alias: params[:reg_alias])

    return redirect_to(homepage_path) unless @region

    # TODO: hacky, replace ASAP
    cookies['petition_mode'] = serialize_hash('true')
    cookies['region']        = serialize_hash(@region.alias)

    @campaigns       = @region.campaigns
    @other_campaigns = []

    @view_style = unserialize_hash(cookies['view_style']) || 'grid'

    if !(campaignData = unserialized_campaigns_cookie).empty?
      # On region pages, only treat available campaigns as possibly selected
      @selected_campaigns = (campaignData['selected'] & @campaigns.collect(&:id))
    end
  end


  def review

    # Save the distinct ids of the user
    save_current_user

    if (selected_campaigns_params = params['campaigns'].try(:[], 'selected'))
      # handles changes to set of selected campaigns
      update_selected_campaigns(selected_campaigns_params)
    end

    # Update petitions to display.
    petitions_to_sign = unserialized_campaigns_cookie['selected']

    if !petitions_to_sign.present?
      return redirect_to homepage_path
    end

    # Find these petitions to display.
    @petitions_to_sign = Campaign.find(petitions_to_sign)

    # remember successful signatures
    if (newly_signed_petition_ids = unserialized_campaigns_cookie['just_signed'])
      @recently_signed_petitions = Campaign.find(newly_signed_petition_ids)
    end

    # Also, make sure we have a user object for
    # the signing fields.
    @user = unserialize_hash(cookies['user']) || {}

    render

  end


  def sign

    if request.post?

      if (selected_campaigns_params = params['campaigns'].try(:[], 'selected'))
        # handles changes to set of selected campaigns
        update_selected_campaigns(selected_campaigns_params)
      else
        return redirect_to homepage_path
      end

      # Update petitions to display.
      petitions_to_sign = unserialized_campaigns_cookie['selected']

      if !petitions_to_sign.present?
        return redirect_to homepage_path
      end

      petitions_to_sign = Campaign.find(petitions_to_sign)

      update_user_params(params['user'])

      user_params = params['user']


      trans_alt_url = 'https://campaigns.transalt.org/modules/custom/luminate_submit/submit.php'

      responses = {}
      mutex = Mutex.new

      THREAD_COUNT.times.map {
        Thread.new(petitions_to_sign) do |petitions|
          while petition = mutex.synchronize { petitions.pop }

            if Rails.env.production?

              res = RestClient.post(
                trans_alt_url,
                title:      user_params['title'],
                firstname:  user_params['first_name'],
                lastname:   user_params['last_name'],
                email:      user_params['email'],
                address:    user_params['address'].try(:[], 'street'),
                zip:        user_params['address'].try(:[], 'zip'),
                phone:      user_params['phone'].try(:gsub, /\D/, ''),
                city:       user_params['address'].try(:[], 'city'),
                state:      user_params['address'].try(:[], 'state'),

                body:       petition.letter,
                subject:    petition.name,
                nodeid:     petition.node_id,
                alertid:    petition.alert_id,
                offlineid:  petition.offline_id,
                offlinenum: petition.offline_num
              )

            else

              success = {"success"=>'success',
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

              res = if Kernel.rand > 0.1
                success
              else
                failure
              end

              # res = if (petitions.count == 1 || true)
              #   failure
              # else
              #   success
              # end

              # res = if (responses.keys.count % 2 == 0 && false)
              #   failure
              # else
              #   success
              # end
            end

            mutex.synchronize { responses[petition.id] = res }

          end
        end
      }.each(&:join)

      # Copy new cookie to make changes then set them.
      cookie_hash = unserialized_campaigns_cookie

      # Gather successful responses and their petitions' ids.
      successful_responses            = responses.select{|_, res| res['success'] == 'success'}

      previously_signed_petitions_ids = cookie_hash['just_signed'] || []
      newly_signed_petition_ids       = successful_responses.keys
      cookie_hash['just_signed']      = previously_signed_petitions_ids + newly_signed_petition_ids

      # Remove signed petitions' ids from
      # selected petitions and campaigns to sign.

      selected_campaign_ids           = cookie_hash['selected'] || []
      remaining_campaign_ids          = selected_campaign_ids - newly_signed_petition_ids
      cookie_hash['selected']         = remaining_campaign_ids

      # Record campaigns that have just been signed and add to the list.
      already_signed_ids              = cookie_hash['already_signed'] || []
      cookie_hash['already_signed']   = already_signed_ids + newly_signed_petition_ids

      # Feed changes back into cookies.
      set_campaigns_cookie(cookie_hash)


      # Update that the user signed these campaigns
      current_user.campaign_ids = (current_user.campaign_ids + newly_signed_petition_ids)


      if responses.all?{|_, res| res['success'] == 'success' }

        return redirect_to thank_you_path, flash: { just_signed: 'true'  }

      else

        @errors = {}
        # populate errors
        responses.each{|k,v| @errors[k] = v['errors'] || []}

        # remember successful signatures
        @recently_signed_petitions = Campaign.find(previously_signed_petitions_ids + newly_signed_petition_ids)

        # reload data
        @petitions_to_sign = Campaign.find(remaining_campaign_ids)

        @user = unserialize_hash(cookies['user']) || {}

        return render

      end

    else

      return redirect_to review_path

    end

  end

  def thank_you

    cookie_hash = unserialized_campaigns_cookie

    just_signed_campaign_ids    = cookie_hash.delete('just_signed') || []
    already_signed_campaign_ids = cookie_hash['already_signed'] || []

    @just_signed_campaigns      = Campaign.find(just_signed_campaign_ids)
    @already_signed_campaigns   = Campaign.find(already_signed_campaign_ids - just_signed_campaign_ids)

    if (@just_signed_campaigns + @already_signed_campaigns).empty?
      return redirect_to '/'
    end

    is_petition_mode = unserialize_hash(cookies['petition_mode']) == 'true'

    if is_petition_mode
      set_campaigns_cookie({})
      update_user_params({})

      if (region = unserialize_hash(cookies['region'])).present?
        @region_alias = region
      end
    else
      set_campaigns_cookie(cookie_hash)
    end

  end


  private


  def serialize_hash(hash_to_serialize)
    JSON.unparse(hash_to_serialize)
  end

  def set_campaigns_cookie(new_cookie_hash)
    cookies['campaigns'] = serialize_hash(new_cookie_hash)
  end


  def update_selected_campaigns(selected_campaigns_params)

    # If the user has deleted some campaigns
    # update the list
    if selected_campaigns_params

      selected_campaigns = unserialize_hash(selected_campaigns_params)
        .reject{ |i| i.to_i == 0 }

      if (cookie_hash = unserialized_campaigns_cookie)
        cookie_hash['selected'] = selected_campaigns

        set_campaigns_cookie(cookie_hash)
      end
    end

  end

  def update_user_params(user_params)
    if user_params
      user_cookie = {}

      ['email', 'first_name', 'last_name', 'phone', 'title'].each do |field|
        user_cookie[field] = (user_params.try(:[], field) || '')
      end

      user_address_cookie = user_cookie['address'] ||= {}
      user_address_params = user_params.try(:[], 'address')

      ['city', 'state', 'street', 'zip'].each do |address_field|
        user_address_cookie[address_field] = (user_address_params.try(:[], address_field) || '')
      end

      cookies['user'] = serialize_hash(user_cookie)

    end

  end

end




