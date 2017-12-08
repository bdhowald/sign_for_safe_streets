class CreateUsersCampaignsJoinTable < ActiveRecord::Migration[5.1]
  def change
    create_join_table :campaigns, :users
  end
end
