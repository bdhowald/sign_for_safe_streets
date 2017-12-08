class ConvertUserIdFieldsToStrings < ActiveRecord::Migration[5.1]
  def change
    change_column :users, :fingerprint_id, :string
    change_column :users, :mixpanel_id, :string
  end
end
