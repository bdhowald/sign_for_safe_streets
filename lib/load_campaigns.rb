# Initialize crawler
more_campaigns     = true
campaign_page      = 0
transalt_campaigns = []

# Collect all campaigns
while more_campaigns do
  scraper = CampaignCrawler.new(campaign_page)
  output = scraper.crawl

  transalt_campaigns = transalt_campaigns + output['campaigns']

  output['campaigns'].empty? ? (more_campaigns = false) : campaign_page +=1
end

# Instantiate Filter
keywords_filter = CampaignKeywordsFilter.new

seen_campaign_ids = Set.new


# Create new Campaign records for each new campaign.
transalt_campaigns.each_with_index do |campaign, num|

  petition_info = campaign['petition_info'].first

  next if petition_info.nil?

  description       = petition_info['campaign_description'].collect{|p| '<p>' + p + '</p>'}.join
  is_success        = !campaign['campaign_won'].nil?
  letter            = petition_info['letter']
  link              = campaign['petition_link']
  name              = petition_info['campaign_name']
  num_signatures    = (campaign['num_signatures'] || '').gsub(/\D/, '').to_i
  signatures_needed = ((petition_info['signatures_needed'] || '').split('of').last || '').gsub(/\D/, '').to_i
  targets           = petition_info['targets']

  borough, starter  = campaign['campaign_starter'].split(' by ')

  alert_id          = petition_info['alert_id']
  node_id           = petition_info['node_id']
  offline_id        = petition_info['offline_id']
  offline_num       = petition_info['offline_num']

  # strip borough of petition and spaces
  borough           = borough.gsub(/petition/i, "").strip

  if num_signatures == 0
    num_signatures = petition_info['num_signatures'].gsub(/\D/, '').to_i
  end

  if targets
    targets.gsub!(/Gov\./, "Governor")

    periods_regex = /[a-z0-9]\./
    if periods_regex.match(targets)
      targets.gsub!(periods_regex){|match| "#{match[0]},"}
    end

    twitter_regex = /[^,] @/
    if twitter_regex.match(targets)
      targets.gsub!(/[^,] @/){|match|
        "#{match[0]}, #{match[2]}"
      }
    end

    community_board_regex = /((Bronx|Brooklyn|Manhattan|Queens|Staten Island) )?Community Boards (\d+(,?))(\s*\d+(,?))*(((\s*)(and|&)(\s*))?)\d+/

    while community_board_regex.match(targets)
      substr_to_replace = community_board_regex.match(targets)[0]

      targets.gsub!(
        substr_to_replace,
        substr_to_replace.scan(/\d+/).collect{ |board_num|
          "#{borough} Community Board #{board_num}"
        }.to_sentence
      )
    end

    if (boards = targets.scan(/Community Board \d+/)) && targets.scan(/(Bronx|Brooklyn|Manhattan|Queens|Staten Island) Community Board \d+/).empty?
      if /(Bronx|Brooklyn|Manhattan|Queens|Staten Island)/.match(borough)
        boards.each{|board|
          targets.gsub!(board, "#{borough} #{board}")
        }
      end
    end

    councilmember_regex = /(council ?member|CM)s\s*[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð\s ,.'-]+\s*(and|&)\s*[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð\s ,'-]+(,|.|$)/i
    while councilmember_regex.match(targets)

      substr_to_replace = councilmember_regex.match(targets)[0]

      targets.gsub!(
        substr_to_replace,
        substr_to_replace
          .gsub(/((, )|( (and|&) )|(, (and|&) ))/i, ', Council Member ')
          .gsub(/((city )?council ?members)/i, 'Council Member')
      )

    end

    if (fix_councilmember_spelling_regex = /((city )?councilmember)/i).match(targets)
      targets.gsub!(fix_councilmember_spelling_regex, 'Council Member')
    end

    semicolon_regex = /([\w\s]+,[\w\s]+;)+[\w\s]+,[\w\s]+/
    if semicolon_regex.match(targets)
      substr_to_replace = semicolon_regex.match(targets)[0]

      targets.gsub!(
        substr_to_replace,
        targets.scan(/([\w\s]+,[\w\s]+)(;|$)/).collect{ |matches|
          arr = matches.collect{|item| item.split(',')}.flatten.collect(&:strip)
          "#{arr[1]} #{arr[0]}"
        }.to_sentence
      )

    end

  end



  if (cp = Campaign.find_by link: link)

    # puts "I already have campaign #{campaign['campaign_name']}"
    cp.update_attributes(
      alert_id:          alert_id,
      borough:           borough,
      description:       description,
      is_success:        is_success,
      letter:            letter,
      name:              name,
      node_id:           node_id,
      num_signatures:    num_signatures,
      offline_id:        offline_id,
      offline_num:       offline_num,
      signatures_needed: signatures_needed,
      targets:           targets
    )

    seen_campaign_ids << cp.id
    keywords_filter.add(cp)

    puts "Updating campaign: #{name}"

  else

    begin
      cp = Campaign.new({
        alert_id:          alert_id,
        borough:           borough,
        description:       description,
        is_success:        is_success,
        letter:            letter,
        link:              link,
        name:              name,
        node_id:           node_id,
        num_signatures:    num_signatures,
        offline_id:        offline_id,
        offline_num:       offline_num,
        signatures_needed: signatures_needed,
        starter:           starter,
        targets:           targets
      })

      puts "Creating new campaign: #{name}."

      cp.save

      seen_campaign_ids << cp.id
      keywords_filter.add(cp)
    rescue ActiveRecord::RecordNotUnique => e
      # log something here
      # send me an email
    end

  end

end

keywords_filter.filter_campaigns


# deactivate campaigns no longer used
inactive_campaigns = Campaign.where.not(id: seen_campaign_ids.to_a)

inactive_campaigns.each do |in_cp|
  if in_cp.is_active
    in_cp.update_attributes(is_active: false)
    puts "Deactivating campaign: #{in_cp.name}"
  else
    puts "Campaign already inactive: #{in_cp.name}"
  end
end

