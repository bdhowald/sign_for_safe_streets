class AddNeededSignaturesToCampaigns < ActiveRecord::Migration[5.1]
  def change
    add_column :campaigns, :needed_signatures, :integer, default: 0
  end
end