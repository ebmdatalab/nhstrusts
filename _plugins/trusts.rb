require 'byebug'
module Jekyll

  # Define a new type of page for companies
  class TrustPage < Page
    def initialize(site, base, trust, hospitality)
      trust_slug = Jekyll::Utils::slugify(trust['name'])
      @site = site
      @base = base
      @dir = 'trusts'
      @name = "#{trust_slug}.html"

      self.process(@name)
      self.read_yaml(File.join(base, '_layouts'), 'trust.html')
      self.data['trust'] = trust
      self.data['title'] = trust['name']
      self.data['hospitality'] = hospitality
      self.data['questions'] = site.data['hospitality-coi-questions'][0]
    end
  end

  class TrustPageGenerator < Generator
    safe true

    def generate(site)
      if site.layouts.key? 'trust'
        hospitality = Hash.new([])
        site.data['hospitality-coi'].each do |datum|
          hospitality[datum['number'].to_i] = datum
          puts "---- #{hospitality}"
        end

        site.data['trusts'].each do |trust|
          puts "++++" + trust['id']
          site.pages << TrustPage.new(site, site.source, trust, hospitality[trust['id'].to_i])
        end
      end
    end
  end

end
