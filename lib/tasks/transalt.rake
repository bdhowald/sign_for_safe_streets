namespace :transalt do
  desc "This task updates all campaigns"
  task :load_campaigns => :environment do |task, args|
    puts "Updating campaigns...\n\n"
    cl = CampaignLoader.new
    cl.run
    puts "Finished updating campaigns!\n\n"
  end
end