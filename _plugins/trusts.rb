require 'byebug'
module Jekyll

  # Define a new type of page for companies
  class TrustPage < Page
    def initialize(site, base, trust, raw_data, scores)
      trust_slug = Jekyll::Utils::slugify(trust['name'])
      @site = site
      @base = base
      @dir = 'trusts'
      @name = "#{trust_slug}.html"

      self.process(@name)
      self.read_yaml(File.join(base, '_layouts'), 'trust.html')
      self.data['trust'] = trust
      self.data['title'] = trust['name']
      self.data['raw_data'] = raw_data
      self.data['scores'] = scores
      self.data['raw_data_questions'] = site.data['hospitality-coi-questions'][0]
    end
  end

  class TrustPageGenerator < Generator
    safe true

    def generate(site)
      if site.layouts.key? 'trust'

        # Make lookup tables by org_code for the answers data
        raw_data = Hash.new([])
        scores_data = Hash.new([])
        site.data['hospitality-coi-raw'].each do |datum|
          datum['figshare_id'] = datum['doi'][/figshare\.(\d+)$/,1]
          raw_data[datum['org_code']] = datum
        end
        site.data['hospitality-coi-scores'].each do |datum|
          scores_data[datum['org_code']] = datum
        end

        # Generate a page for each trust
        site.data['trusts'].each do |trust|
          site.pages << TrustPage.new(site, site.source, trust, raw_data[trust['org_code']], scores_data[trust['org_code']])
        end
      end
    end
  end

end
