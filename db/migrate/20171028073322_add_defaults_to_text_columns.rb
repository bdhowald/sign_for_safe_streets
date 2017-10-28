class AddDefaultsToTextColumns < ActiveRecord::Migration[5.1]
  def change
    change_column :campaigns, :letter, :text, default: ''
    change_column :campaigns, :targets, :text, default: ''
  end
end
