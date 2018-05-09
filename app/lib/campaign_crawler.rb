require 'wombat'

class CampaignCrawler
  include Wombat::Crawler

  def initialize(petition_link)
    super()
    path "#{petition_link}"
  end

  base_url 'https://campaigns.transalt.org'
  # base_url 'http://ptsv2.com/'

  # some_data css: "cdiv.elemClass .anchor"
  # another_info xpath: "//my/xpath[@style='selector']"

  # campaigns do |c|
  #   c.newsd "css=.col-sm-4",
  # end

  # # campaign_name 'css=div.views-field-title a'
  # campaign_starter 'css=div.views-field-field-first-name'
  # # borough 'css=div.views-field-field-first-name span'
  # num_signatures 'css=div.home-sigcount span'
  # # petition_link "css=div.field-content", :html
  # petition_link "xpath=.//div[contains(@class, 'views-field-field-background-image')]//a/@href"

  # campaign_won "xpath=.//div[@class='yesvictory']"

  # petition_info "xpath=.//div[contains(@class, 'views-field-field-background-image')]//a", :follow do |link|
  alert_id "xpath=.//div[contains(@class, 'field--name-field-action-alert-id')]", :text
  campaign_name "xpath=.//div[@role='heading']//h1[@class='page-header']"
  campaign_description "xpath=.//div[contains(@class, 'field--name-field-please-sign')]//p", :list
  letter "xpath=.//div[contains(@class, 'field--name-field-to-send')]"
  node_id "xpath=.//article[contains(@class, 'petition') and contains(@class, 'is-promoted')]/@data-history-node-id"
  offline_id "xpath=.//div[contains(@class, 'field--name-field-offline-issue-id')]", :text
  offline_num "xpath=.//div[contains(@class, 'field--name-field-offline-signatures')]", :text
  num_signatures "xpath=.//div[@class='petitionsigners']//span[@id='oldsignercount']"
  signatures_needed "xpath=.//div[@class='petitionsigners']"
  targets "xpath=.//div[contains(@class, 'field--name-field-recipients')]//div[@class='field--item']"
  # end

end
