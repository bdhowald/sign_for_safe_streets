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

  link           = campaign['petition_link']
  num_signatures = (campaign['num_signatures'] || "").gsub(/\D/, '').to_i
  name           = petition_info['campaign_name']
  description    = petition_info['campaign_description']

  borough, starter = campaign['campaign_starter'].split(' by ')

  if (cp = Campaign.find_by link: link)

    # puts "I already have campaign #{campaign['campaign_name']}"
    cp.update_attributes(
      borough:        borough.gsub(/petition/i, "").strip,
      description:    description.collect{|p| '<p>' + p + '</p>'}.join,
      name:           name,
      num_signatures: num_signatures
    )

    seen_campaign_ids << cp.id
    keywords_filter.add(cp)

  else

    begin
      cp = Campaign.new({
        borough:        borough,
        description:    description.collect{|p| '<p>' + p + '</p>'}.join,
        link:           campaign['petition_link'],
        name:           name,
        num_signatures: num_signatures,
        starter:        starter
      })

      puts "Creating new campaign: #{campaign['campaign_name']}"

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

