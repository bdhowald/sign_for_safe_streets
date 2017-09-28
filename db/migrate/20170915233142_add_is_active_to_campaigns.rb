class AddIsActiveToCampaigns < ActiveRecord::Migration[5.1]
  def change
    add_column :campaigns, :is_active, :boolean, null: false, default: true
  end
end
