# Initialize crawler
more_campaigns     = true
campaign_page      = 0
transalt_campaigns = []

# Collect all campaigns
while more_campaigns do
  scraper = CampaignCrawler.new(campaign_page)
  output = scraper.crawl

  # pp output['campaigns']

  transalt_campaigns = transalt_campaigns + output["campaigns"]

  output["campaigns"].empty? ? (more_campaigns = false) : campaign_page +=1
end

# Instantiate Filter
keywords_filter = CampaignKeywordsFilter.new

seen_campaign_ids = Set.new


# Create new Campaign records for each new campaign.
transalt_campaigns.each do |campaign|

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

    community_board_regex = /((Bronx|Brooklyn|Manhattan|Queens|Staten Island) )?Community Boards (\d+(,?))(\s*\d+(,?))* (and|&) \d+/
    if community_board_regex.match(targets)

      substr_to_replace = community_board_regex.match(targets)[0]

      targets.gsub!(
        substr_to_replace,
        substr_to_replace.scan(/\d+/).collect{ |elem|
          "#{borough} Community Board #{elem}"
        }.to_sentence
      )
    end

    if (boards = targets.scan(/Community Board \d+/)) && targets.scan(/#{borough} Community Board \d+/).empty?
      boards.each{|board|
        targets.gsub!(board, "#{borough} #{board}")
      }
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
  in_cp.update_attributes(is_active: false)
end

