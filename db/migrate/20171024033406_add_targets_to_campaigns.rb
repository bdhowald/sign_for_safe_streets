class AddTargetsToCampaigns < ActiveRecord::Migration[5.1]
  def change
    add_column :campaigns, :targets, :text
  end
end
