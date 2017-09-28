require 'wombat'

class CampaignCrawler
  include Wombat::Crawler

  def initialize(campaign_page = 0)
    super()
    @campaign_page = campaign_page
    path "/node?page=#{@campaign_page}"
  end

  base_url 'https://campaigns.transalt.org'

  # some_data css: "cdiv.elemClass .anchor"
  # another_info xpath: "//my/xpath[@style='selector']"

  # campaigns do |c|
  #   c.newsd "css=.col-sm-4",
  # end

  campaigns "xpath=//div[contains(@class, 'col-sm-4')]", :iterator do |campaign|
    # campaign_name 'css=div.views-field-title a'
    campaign_starter 'css=div.views-field-field-first-name'
    # borough 'css=div.views-field-field-first-name span'
    num_signatures 'css=div.home-sigcount span'
    # petition_link "css=div.field-content", :html
    petition_link "xpath=.//div[contains(@class, 'views-field-field-background-image')]//a/@href"

    petition_info "xpath=.//div[contains(@class, 'views-field-field-background-image')]//a", :follow do |link|
      campaign_name "xpath=.//div[@class='text-center']//h1[@class='page-header']"
      campaign_description "xpath=.//div[contains(@class, 'field-name-field-please-sign')]//p", :list
    end

  end

end
