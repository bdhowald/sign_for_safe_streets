class AddCampaignTagIndices < ActiveRecord::Migration[5.1]
  def change
    add_index :campaigns_tags, [:campaign_id, :tag_id], :unique => true
    add_index :campaigns_tags, :tag_id
  end
end
