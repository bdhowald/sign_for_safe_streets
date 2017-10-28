class AddLetterToCampaigns < ActiveRecord::Migration[5.1]
  def change
    add_column :campaigns, :letter, :text
  end
end
