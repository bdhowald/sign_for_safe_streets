class AddUnknownFieldsToCampaigns < ActiveRecord::Migration[5.1]
  def change
    add_column :campaigns, :alert_id, :integer
    add_column :campaigns, :node_id, :integer
    add_column :campaigns, :offline_id, :integer
    add_column :campaigns, :offline_num, :integer
  end
end
