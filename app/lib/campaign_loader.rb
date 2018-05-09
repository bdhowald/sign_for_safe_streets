require 'nokogiri'

class CampaignLoader

  # Process each step of operation from scraping to filtering.
  # @name run
  #
  def run
    scraped_data        = scrape_campaigns
    processed_campaigns = process_raw_campaign_data(scraped_data)

    filter_processed_campaigns(processed_campaigns)
    deactivate_inactive_campaigns(processed_campaigns)
  end


  # Get campaigns from TransAlt website
  # @name scrape_campaigns
  #
  def scrape_campaigns
    # Initialize crawler
    more_campaigns     = true
    campaign_page      = 0
    transalt_campaigns = []

    data = {
      'view_display_id' => 'page_1',
      'view_name' => '_home_petition_list',
      # 'borough[1]' => '1',
      # 'borough[2]' => '2',
      # 'borough[3]' => '3',
      # 'borough[4]' => '4',
      # 'borough[5]' => '5',
      # 'borough[6]' => '6',
      # 'borough[7]' => '7',
      'combine' => '',
      'view_path' => '/views/ajax',
      'view_base_path' => 'home',
      'view_args' => '',
      'view_dom_id' => 'c5036e4601024421270b27f484096004a8aa4a88664489eefc8a07bef3d6a9ee',
      'pager_element' => 0,
      '_wrapper_format' => 'drupal_ajax',
      'page' => campaign_page,
      '_drupal_ajax' => 1,
      'ajax_page_state[theme]' => 'whitman',
      'ajax_page_state[theme_token]' => '',
      'ajax_page_state[libraries]' => 'better_exposed_filters/auto_submit,better_exposed_filters/general,bootstrap/popover,bootstrap/tooltip,core/html5shiv,google_analytics/google_analytics,system/base,views/views.ajax,views/views.module,views_infinite_scroll/views-infinite-scroll,whitman/cloud-typography,whitman/font-awesome,whitman/global-styling,whitman/petition-scripts'
    }

    puts "Scraping campaigns..."
    # Collect all campaigns
    while more_campaigns do

      puts "Scraping page #{campaign_page}"

      # update page
      data['page'] = campaign_page

      url = 'https://campaigns.transalt.org/views/ajax?_wrapper_format=drupal_ajax'
      res = RestClient.post(url, data)

      campaign_json  = JSON.parse(res.body).last['data'].gsub("\n", '')
      noko_doc       = Nokogiri::HTML.parse(campaign_json)

      petition_links = noko_doc.xpath(".//div[contains(@class, 'views-field-field-background-image')]//a/@href").collect{|cp| cp.value}

      petition_links.each_with_index do |link, num|

        next if link =~ /null/

        borough_info   = noko_doc.xpath(".//div[@class='views-field views-field-field-first-name']//span")[num].children.text.gsub(/ Petition$/, '')
        starter_info   = noko_doc.xpath(".//div[@class='views-field views-field-field-first-name']//div[@class='field-content']")[num].children.last.text.gsub(/^ by /, '')
        num_signatures = noko_doc.xpath(".//div[@class='views-field views-field-field-victory']//div[@class='home-sigcount']")[num].children[0].text
        # campaign_won   = ?

        scraper = CampaignCrawler.new(link)

        output = scraper.crawl

        output['borough']          = borough_info
        output['campaign_starter'] = starter_info
        output['num_signatures']   = num_signatures
        output['petition_link']    = link

        transalt_campaigns = transalt_campaigns + [output]

      end

      petition_links.count == 0 ? (more_campaigns = false) : campaign_page +=1
    end

    puts "Scraped #{campaign_page} pages\n\n"

    transalt_campaigns
  end


  # Turn raw campaign data into form needed for database
  # @name  form_campaign
  # @param {Hash} campaign_hash - hash of data returned by scraper from TransAlt website
  #
  def form_campaign(campaign_hash)

    processed_data = {}

    processed_data[:description]       = campaign_hash['campaign_description'].collect{|p| '<p>' + p + '</p>'}.join
    processed_data[:is_success]        = !campaign_hash['campaign_won'].nil?
    processed_data[:letter]            = campaign_hash['letter']
    processed_data[:link]              = campaign_hash['petition_link']
    processed_data[:name]              = campaign_hash['campaign_name']
    processed_data[:num_signatures]    = (campaign_hash['num_signatures'] || '').gsub(/\D/, '').to_i
    processed_data[:signatures_needed] = ((campaign_hash['signatures_needed'] || '').split('of').last || '').gsub(/\D/, '').to_i

    targets                  = campaign_hash['targets']

    # strip borough of petition and spaces
    processed_data[:borough] = campaign_hash['borough']
    processed_data[:starter] = campaign_hash['campaign_starter']


    processed_data[:alert_id]          = campaign_hash['alert_id']
    processed_data[:node_id]           = campaign_hash['node_id']
    processed_data[:offline_id]        = campaign_hash['offline_id']
    processed_data[:offline_num]       = campaign_hash['offline_num']

    if processed_data[:num_signatures] == 0
      processed_data[:num_signatures]  = campaign_hash['num_signatures'].gsub(/\D/, '').to_i
    end

    processed_data[:targets] = rectify_targets(targets, processed_data[:borough])

    campaign = create_or_update_campaign(processed_data)

    campaign

  end


  # Create or update campaign with new data
  # @name  create_or_update_campaign
  # @param {Hash} campaign_data_hash - hash of processed data ready for saving
  #
  def create_or_update_campaign(campaign_data_hash)

    if (cp = Campaign.find_by link: campaign_data_hash[:link])

      # puts "I already have campaign #{campaign['campaign_name']}"
      cp.update_attributes(
        alert_id:          campaign_data_hash[:alert_id],
        borough:           campaign_data_hash[:borough],
        description:       campaign_data_hash[:description],
        is_success:        campaign_data_hash[:is_success],
        letter:            campaign_data_hash[:letter],
        name:              campaign_data_hash[:name],
        node_id:           campaign_data_hash[:node_id],
        num_signatures:    campaign_data_hash[:num_signatures],
        offline_id:        campaign_data_hash[:offline_id],
        offline_num:       campaign_data_hash[:offline_num],
        signatures_needed: campaign_data_hash[:signatures_needed],
        targets:           campaign_data_hash[:targets]
      )

      puts "Updating campaign: #{campaign_data_hash[:name]}."

      cp

    else

      begin

        cp = Campaign.create({
          alert_id:          campaign_data_hash[:alert_id],
          borough:           campaign_data_hash[:borough],
          description:       campaign_data_hash[:description],
          is_success:        campaign_data_hash[:is_success],
          letter:            campaign_data_hash[:letter],
          link:              campaign_data_hash[:link],
          name:              campaign_data_hash[:name],
          node_id:           campaign_data_hash[:node_id],
          num_signatures:    campaign_data_hash[:num_signatures],
          offline_id:        campaign_data_hash[:offline_id],
          offline_num:       campaign_data_hash[:offline_num],
          signatures_needed: campaign_data_hash[:signatures_needed],
          starter:           campaign_data_hash[:starter],
          targets:           campaign_data_hash[:targets]
        })

        puts "Creating new campaign: #{campaign_data_hash[:name]}."

        cp
      rescue ActiveRecord::RecordNotUnique => e
        # log something here
        # send me an email
      end

    end
  end

  # Long set of ugly regexes to turn targets strings into standardized
  # form for mobile or desktop viewing.
  # @name  rectify_targets
  # @param {String} targets_string - scraped string of campaign targets
  # @param {String} borough        - borough of campaign
  #
  def rectify_targets(targets_string, borough)
    if targets_string
      targets_string.gsub!(/Gov\./, "Governor")

      periods_regex = /[a-z0-9]\./
      if periods_regex.match(targets_string)
        targets_string.gsub!(periods_regex){|match| "#{match[0]},"}
      end

      twitter_regex = /[^,] @/
      if twitter_regex.match(targets_string)
        targets_string.gsub!(/[^,] @/){|match|
          "#{match[0]}, #{match[2]}"
        }
      end

      community_board_regex = /((Bronx|Brooklyn|Manhattan|Queens|Staten Island) )?Community Boards (\d+(,?))(\s*\d+(,?))*(((\s*)(and|&)(\s*))?)\d+/

      while community_board_regex.match(targets_string)
        substr_to_replace = community_board_regex.match(targets_string)[0]

        targets_string.gsub!(
          substr_to_replace,
          substr_to_replace.scan(/\d+/).collect{ |board_num|
            "#{borough} Community Board #{board_num}"
          }.to_sentence
        )
      end

      if (boards = targets_string.scan(/Community Board \d+/)) && targets_string.scan(/(Bronx|Brooklyn|Manhattan|Queens|Staten Island) Community Board \d+/).empty?
        if /(Bronx|Brooklyn|Manhattan|Queens|Staten Island)/.match(borough)
          boards.each{|board|
            targets_string.gsub!(board, "#{borough} #{board}")
          }
        end
      end

      councilmember_regex = /(council ?member|CM)s\s*[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð\s ,.'-]+\s*(and|&)\s*[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð\s ,'-]+(,|.|$)/i
      while councilmember_regex.match(targets_string)

        substr_to_replace = councilmember_regex.match(targets_string)[0]

        targets_string.gsub!(
          substr_to_replace,
          substr_to_replace
            .gsub(/((, )|( (and|&) )|(, (and|&) ))/i, ', Council Member ')
            .gsub(/((city )?council ?members)/i, 'Council Member')
        )

      end

      if (fix_councilmember_spelling_regex = /((city )?councilmember)/i).match(targets_string)
        targets_string.gsub!(fix_councilmember_spelling_regex, 'Council Member')
      end

      semicolon_regex = /([\w\s]+,[\w\s]+;)+[\w\s]+,[\w\s]+/
      if semicolon_regex.match(targets_string)
        substr_to_replace = semicolon_regex.match(targets_string)[0]

        targets_string.gsub!(
          substr_to_replace,
          targets_string.scan(/([\w\s]+,[\w\s]+)(;|$)/).collect{ |matches|
            arr = matches.collect{|item| item.split(',')}.flatten.collect(&:strip)
            "#{arr[1]} #{arr[0]}"
          }.to_sentence
        )

      end
    end

    targets_string
  end


  # Wrapper method to turn scraped data hashes into campaign records
  # @name  process_raw_campaign_data
  # @param {Array} scraped_data_array - array of scraped campaign data hashes
  #
  def process_raw_campaign_data(scraped_data_array)

    puts "Processing raw campaign data..."

    processed_campaigns = []

    # Create new Campaign records for each new campaign.
    scraped_data_array.each do |raw_campaign_data|
      # get new or updated campaign from form_campaign
      campaign = form_campaign(raw_campaign_data)

      # Only add campaign if scrape returns something useful.
      if campaign
        processed_campaigns << campaign
      end

    end

    puts "\nFinished processing raw campaign data\n"

    puts "\nCreated or updated #{processed_campaigns.count} campaigns\n"

    processed_campaigns

  end

  # Deactivates campaigns which are no longer on the TransAlt website
  # @name  deactivate_inactive_campaigns
  # @param {Array} active_campaigns - array of active campaigns
  #
  def deactivate_inactive_campaigns(active_campaigns)

    puts "Deactivating inactive campaigns..."

    # Keep track of campaigns we have seen
    seen_campaign_ids = Set.new(active_campaigns.collect(&:id))

    newly_inactive_campaigns = 0

    # deactivate campaigns no longer used
    inactive_campaigns = Campaign.where.not(id: seen_campaign_ids.to_a)

    inactive_campaigns.each do |in_cp|
      if in_cp.is_active
        in_cp.update_attributes(is_active: false)

        newly_inactive_campaigns += 1
        puts "Deactivating campaign: #{in_cp.name}"
      else
        puts "Campaign already inactive: #{in_cp.name}"
      end
    end

    puts "Deactivated #{newly_inactive_campaigns} campaign#{newly_inactive_campaigns == 1 ? '' : 's'}"
    puts "#{inactive_campaigns.count} inactive campaign#{inactive_campaigns.count == 1 ? '' : 's'} total\n\n"

  end

  # Tags campaigns with categories and tags.
  # @name  filter_processed_campaigns
  # @param {Array} processed_campaigns - array of processed and active campaigns
  #
  def filter_processed_campaigns(processed_campaigns)
    puts "\nFiltering campaigns..."
    CampaignKeywordsFilter.new(processed_campaigns).filter_campaigns
    puts "\nFinished filtering campaigns\n"
  end


end

