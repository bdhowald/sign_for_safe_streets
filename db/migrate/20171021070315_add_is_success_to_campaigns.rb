class AddIsSuccessToCampaigns < ActiveRecord::Migration[5.1]
  def change
    add_column :campaigns, :is_success, :iboolean, default: false
  end
end
