class CampaignsTags < ActiveRecord::Migration[5.1]
  def change
    create_table :campaigns_tags, :id => false do |t|
      t.integer :campaign_id
      t.integer :tag_id
    end
  end
end
