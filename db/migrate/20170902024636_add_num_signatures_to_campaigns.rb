class AddNumSignaturesToCampaigns < ActiveRecord::Migration[5.1]
  def change
    add_column :campaigns, :num_signatures, :integer, null: false, default: 0
  end
end
